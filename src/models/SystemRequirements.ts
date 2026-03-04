import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class SystemRequirements extends Model {
	public id!: number;
	public gameId!: number;
	public os!: string;
	public processor!: string;
	public memory!: string;
	public graphics!: string;
	public storage!: string;
	public createdAt!: Date;
}

SystemRequirements.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		gameId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
			field: "game_id",
		},
		os: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		processor: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		memory: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		graphics: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		storage: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			field: "created_at",
		}
	},
	{
		sequelize,
		tableName: "system_requirements",
		timestamps: false,
		indexes: [
			{ fields: ["game_id"] },
		],
	}
);

export default SystemRequirements;
