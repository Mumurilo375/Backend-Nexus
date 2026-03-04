Lista de comandos do Sequelize: 
_____________________________________________________________________________________
Tipos de String/Binário
    STRING — String de tamanho variável (ex: STRING(255))
    STRING.BINARY — String com collation binária
    TEXT — Texto longo (pode ter tamanhos: "tiny", "medium", "long")
    CITEXT — Texto insensível a maiúsculas/minúsculas (PostgreSQL/SQLite)
    CHAR — String de tamanho fixo
    CHAR.BINARY — String binária de tamanho fixo
    BINARY — Dados binários de tamanho variável
    BLOB — Binary large object (pode ser "tiny", "medium" ou "long")
Tipos Numéricos
    INTEGER — Inteiro padrão (.UNSIGNED, .ZEROFILL)
    BIGINT — Inteiro grande para valores maiores (.UNSIGNED, .ZEROFILL)
    FLOAT — Número ponto flutuante
    REAL — Ponto flutuante (PostgreSQL/MySQL)
    DOUBLE — Ponto flutuante de dupla precisão
    DECIMAL — Decimal com precisão fixa (ex: DECIMAL(10,2))
    TINYINT — Inteiro muito pequeno
    SMALLINT — Inteiro pequeno
    MEDIUMINT — Inteiro médio
    Booleano
    BOOLEAN — Verdadeiro ou falso
Data e Hora
    DATE — Data e hora
    DATEONLY — Apenas data, sem hora
    TIME — Apenas hora, sem data
    NOW — Valor padrão para timestamp atual
    Tipos Especiais
    ENUM — Lista de valores string possíveis
    UUID — Identificador único universal
    UUIDV1 / UUIDV4 — Valores padrão para geração de UUID
    JSON — Objeto JSON
    JSONB — JSON binário (PostgreSQL)
    ARRAY — Array de um tipo específico (PostgreSQL)
    RANGE — Range de um tipo (PostgreSQL)
    GEOGRAPHY — Dados geoespaciais
    GEOMETRY — Dados de geometria
    HSTORE — Armazenamento chave/valor (PostgreSQL)
    VIRTUAL — Campo apenas no modelo, não persiste no banco
Tipos Específicos do PostgreSQL
    MACADDR, MACADDR8 — Endereços MAC
    INET, CIDR — Tipos de rede IP
    TSVECTOR — Vetor de busca de texto
Propriedades Comuns
    type — Define o tipo de dado
    allowNull: false — Campo obrigatório
    primaryKey: true — Chave primária
    autoIncrement: true — Incrementa automaticamente
    defaultValue — Valor padrão
    unique: true — Valor único
    validate: {} — Validações customizadas
    comment — Comentário sobre o campo





COMO DECLARAR RELACIONAMENTOS NO SEQUELIZE
_____________________________________________________________________________________
Tipos de Relacionamentos no Sequelize
    1. hasMany (Um para Muitos)
        Um usuário pode ter muitos posts.
            // Em User.ts
            User.hasMany(Post, { foreignKey: 'userId' });
        Isso adiciona automaticamente a coluna userId na tabela Post.
    2. belongsTo (Muitos para Um)
        Um post pertence a um usuário.
            // Em Post.ts
            Post.belongsTo(User, { foreignKey: 'userId' });
    3. belongsToMany (Muitos para Muitos)
        Muitos usuários podem ter muitos roles (através de uma tabela de junção).
            User.belongsToMany(Role, { 
              through: 'UserRoles',  // Nome da tabela de junção
              foreignKey: 'userId'
            });
            Role.belongsToMany(User, { 
              through: 'UserRoles',
              foreignKey: 'roleId'
            });

Onde colocar os relacionamentos?
    Dentro de cada Model (Recomendado)

User.ts:

import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Post from "./Post";

class User extends Model {
    public id!: number;
    public name!: string;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    sequelize,
    tableName: "user",
});

// Relacionamento aqui
→ → → → User.hasMany(Post, { foreignKey: 'userId' }); ← ← ← ←

export default User;


Post.ts:
//codigo do model ...
Post.belongsTo(User, { foreignKey: 'userId' });
export default Post;
___________________________________________________
Como usar os relacionamentos (Queries)
// Buscar usuário com seus posts
    const user = await User.findOne({
      where: { id: 1 },
      include: [Post]
    });
    
// Buscar post com o usuário
    const post = await Post.findOne({
      where: { id: 1 },
      include: [User]
    });
    
    // Criar relacionamento
    const user = await User.findByPk(1);
    const post = await Post.create({ title: 'Novo Post' });
    await user.addPost(post); // ou post.setUser(user);

                RESUMO DOS MÉTODOS
      Método	                 O que faz
---------------------------------------------------------
hasMany()	            Define que A tem muitos B
belongsTo()	            Define que B pertence a A
belongsToMany()	        Define relacionamento muitos-para-muitos
.include[]	            Carrega dados relacionados nas queries
.addPost()	            Adiciona um post ao usuário
.getPost()	Busca posts do usuário
