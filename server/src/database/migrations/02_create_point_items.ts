import Knex from 'knex';

export async function up(knex: Knex) {
    // CRIAR/ALTERAR A TABELA/CAMPOS
    return knex.schema.createTable('point_items', table => {
        table.increments('id').primary();
        table.integer('id_ponto').notNullable().references('id').inTable('points');
        table.integer('id_item').notNullable().references('id').inTable('items');
    });
}

export async function down(knex: Knex) {
    // VOLTAR ATRAS (DELETAR A TABELA/CAMPOS)
    return knex.schema.dropTable('point_items');
}