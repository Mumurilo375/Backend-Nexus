'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const passwordHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

    const usersWithFixedIds = [
      { id: 1, username: 'admin', email: 'admin@nexus.com', password_hash: passwordHash, full_name: 'Administrador', cpf: '11111111111', is_admin: true, created_at: now, updated_at: now },
      { id: 2, username: 'usuario_teste', email: 'teste@nexus.com', password_hash: passwordHash, full_name: 'Usuário Teste', cpf: '22222222222', is_admin: false, created_at: now, updated_at: now },
      { id: 3, username: 'maria_silva', email: 'maria.silva@email.com', password_hash: passwordHash, full_name: 'Maria Silva', cpf: '33333333333', is_admin: false, created_at: now, updated_at: now },
      { id: 4, username: 'joao_santos', email: 'joao.santos@email.com', password_hash: passwordHash, full_name: 'João Santos', cpf: '44444444444', is_admin: false, created_at: now, updated_at: now },
      { id: 5, username: 'ana_oliveira', email: 'ana.oliveira@email.com', password_hash: passwordHash, full_name: 'Ana Oliveira', cpf: '55555555555', is_admin: false, created_at: now, updated_at: now },
      { id: 6, username: 'pedro_costa', email: 'pedro.costa@email.com', password_hash: passwordHash, full_name: 'Pedro Costa', cpf: '66666666666', is_admin: false, created_at: now, updated_at: now },
      { id: 7, username: 'carla_lima', email: 'carla.lima@email.com', password_hash: passwordHash, full_name: 'Carla Lima', cpf: '77777777777', is_admin: false, created_at: now, updated_at: now },
      { id: 8, username: 'lucas_ferreira', email: 'lucas.ferreira@email.com', password_hash: passwordHash, full_name: 'Lucas Ferreira', cpf: '88888888888', is_admin: false, created_at: now, updated_at: now },
      { id: 9, username: 'julia_rocha', email: 'julia.rocha@email.com', password_hash: passwordHash, full_name: 'Julia Rocha', cpf: '99999999999', is_admin: false, created_at: now, updated_at: now },
      { id: 10, username: 'rafael_alves', email: 'rafael.alves@email.com', password_hash: passwordHash, full_name: 'Rafael Alves', cpf: '10101010101', is_admin: false, created_at: now, updated_at: now },
    ];

    const usersAutoIncrement = [
      { username: 'fernanda_souza', email: 'fernanda.souza@email.com', password_hash: passwordHash, full_name: 'Fernanda Souza', cpf: '12121212121', is_admin: false, created_at: now, updated_at: now },
      { username: 'bruno_carvalho', email: 'bruno.carvalho@email.com', password_hash: passwordHash, full_name: 'Bruno Carvalho', cpf: '13131313131', is_admin: false, created_at: now, updated_at: now },
      { username: 'patricia_gomes', email: 'patricia.gomes@email.com', password_hash: passwordHash, full_name: 'Patricia Gomes', cpf: '14141414141', is_admin: false, created_at: now, updated_at: now },
      { username: 'gustavo_ribeiro', email: 'gustavo.ribeiro@email.com', password_hash: passwordHash, full_name: 'Gustavo Ribeiro', cpf: '15151515151', is_admin: false, created_at: now, updated_at: now },
      { username: 'camila_martins', email: 'camila.martins@email.com', password_hash: passwordHash, full_name: 'Camila Martins', cpf: '16161616161', is_admin: false, created_at: now, updated_at: now },
      { username: 'rodrigo_dias', email: 'rodrigo.dias@email.com', password_hash: passwordHash, full_name: 'Rodrigo Dias', cpf: '17171717171', is_admin: false, created_at: now, updated_at: now },
      { username: 'leticia_nunes', email: 'leticia.nunes@email.com', password_hash: passwordHash, full_name: 'Leticia Nunes', cpf: '18181818181', is_admin: false, created_at: now, updated_at: now },
      { username: 'moderador', email: 'mod@nexus.com', password_hash: passwordHash, full_name: 'Moderador Nexus', cpf: '19191919191', is_admin: true, created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('users', usersWithFixedIds, {});
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;"
    );
    await queryInterface.bulkInsert('users', usersAutoIncrement, {});
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
