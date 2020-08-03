import Knex from 'knex';

export async function up(knex: Knex) {
    // CRIAR/ALTERAR A TABELA/CAMPOS
    return knex.schema.createTable('items', table => {
        table.increments('id').primary();
        table.string('imagem').notNullable();
        table.string('titulo').notNullable();
    });
}

export async function down(knex: Knex) {
    // VOLTAR ATRAS (DELETAR A TABELA/CAMPOS)
    return knex.schema.dropTable('items');
}