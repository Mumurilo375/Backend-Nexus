import { promises as fs } from "fs";
import path from "path";

const mediaPrefix = "/media";
const backendRoot = path.resolve(__dirname, "..", "..");
const storageRoot = path.join(backendRoot, "storage");
const temporaryUploadRoot = path.join(storageRoot, "tmp");

function normalizeSlashes(value: string) {
  return value.replace(/\\/g, "/");
}

function sanitizeSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function createUniqueFileName(originalName: string) {
  const extension = path.extname(originalName) || ".bin";
  const baseName = sanitizeSegment(path.basename(originalName, extension)) || "image";
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}-${baseName}${extension.toLowerCase()}`;
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function removeEmptyDirectories(startDirectory: string) {
  let currentDirectory = startDirectory;

  while (currentDirectory.startsWith(storageRoot) && currentDirectory !== storageRoot) {
    let entries: string[];

    try {
      entries = await fs.readdir(currentDirectory);
    } catch {
      return;
    }

    if (entries.length > 0) {
      return;
    }

    try {
      await fs.rmdir(currentDirectory);
    } catch {
      return;
    }

    currentDirectory = path.dirname(currentDirectory);
  }
}

export function getStorageRoot() {
  return storageRoot;
}

export function getTemporaryUploadRoot() {
  return temporaryUploadRoot;
}

export async function ensureMediaStorage() {
  await Promise.all([
    fs.mkdir(temporaryUploadRoot, { recursive: true }),
    fs.mkdir(path.join(storageRoot, "games"), { recursive: true }),
    fs.mkdir(path.join(storageRoot, "legacy"), { recursive: true }),
  ]);
}

export function createManagedMediaUrl(relativePath: string) {
  const safeRelativePath = normalizeSlashes(relativePath).replace(/^\/+/, "");
  return `${mediaPrefix}/${safeRelativePath}`;
}

export function isManagedMediaUrl(value?: string | null) {
  return Boolean(value && value.startsWith(`${mediaPrefix}/`));
}

export function getManagedMediaAbsolutePath(value: string) {
  if (!isManagedMediaUrl(value)) {
    return null;
  }

  const relativePath = value.slice(mediaPrefix.length).replace(/^\/+/, "");
  const absolutePath = path.resolve(storageRoot, relativePath);

  if (!absolutePath.startsWith(storageRoot)) {
    return null;
  }

  return absolutePath;
}

export async function deleteManagedMedia(value?: string | null) {
  if (!value || !isManagedMediaUrl(value)) {
    return;
  }

  const absolutePath = getManagedMediaAbsolutePath(value);
  if (!absolutePath || !(await pathExists(absolutePath))) {
    return;
  }

  await fs.unlink(absolutePath);
  await removeEmptyDirectories(path.dirname(absolutePath));
}

export async function deleteManagedMediaList(values: Array<string | null | undefined>) {
  for (const value of values) {
    await deleteManagedMedia(value);
  }
}

export async function deleteTemporaryUpload(file?: Express.Multer.File | null) {
  if (!file?.path || !(await pathExists(file.path))) {
    return;
  }

  await fs.unlink(file.path);
}

export async function deleteTemporaryUploads(files: Array<Express.Multer.File | null | undefined>) {
  await Promise.all(files.map((file) => deleteTemporaryUpload(file)));
}

export async function moveUploadedGameImage(
  file: Express.Multer.File,
  options: { gameId: number; kind: "cover" | "gallery" },
) {
  const targetDirectory = path.join(
    storageRoot,
    "games",
    String(options.gameId),
    options.kind,
  );

  await fs.mkdir(targetDirectory, { recursive: true });

  const targetPath = path.join(targetDirectory, createUniqueFileName(file.originalname));
  await fs.rename(file.path, targetPath);

  return createManagedMediaUrl(path.relative(storageRoot, targetPath));
}

export async function ensureManagedLegacyMedia(
  sourceRelativePath: string,
  targetRelativePath: string,
) {
  const normalizedSource = normalizeSlashes(sourceRelativePath).replace(/^\/+/, "");
  const normalizedTarget = normalizeSlashes(targetRelativePath).replace(/^\/+/, "");
  const targetPath = path.join(storageRoot, normalizedTarget);

  if (!(await pathExists(targetPath))) {
    const sourcePath = path.resolve(backendRoot, "..", "frontend", "public", normalizedSource);

    if (!(await pathExists(sourcePath))) {
      return null;
    }

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);
  }

  return createManagedMediaUrl(normalizedTarget);
}


