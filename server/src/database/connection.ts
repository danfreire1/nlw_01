import knex from 'knex';
import path from 'path';

// __dirname - Variavel global que sempre retorna o caminho do arquivo que está executando ele

/* Existe um arquivo Entidade_Relacionamento na pasta da NLW que mostra as tabelas com os respectivos campos que serão
criados */ 

const connection = knex ({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'databse.sqlite'),
    },
    useNullAsDefault: true,
});

export default connection;

// Migrations: Histórico do banco de dados