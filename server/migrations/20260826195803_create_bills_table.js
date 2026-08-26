/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('bills', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('card_id').references('id').inTable('cards').onDelete('SET NULL');
    table.uuid('category_id').references('id').inTable('categories').onDelete('SET NULL');

    table.string('name').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.date('due_date').notNullable();
    table.string('status').notNullable().defaultTo('unpaid');
    table.check('?? IN (?, ?, ?)', ['status', 'paid', 'unpaid', 'upcoming']);
    table.boolean('recurring').notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('bills');
};
