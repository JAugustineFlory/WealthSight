/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('cards', (table) => {
     //Primary Key and Foreign key
     table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
     //Foreign key, user id linking this to users
     table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    /**Other Keys
     * 
     */
    table.string('nickname').notNullable();
    table.string('organization').notNullable();
    // 10 is num digits allowed, 2 is digits after decimal
    table.decimal('credit_limit', 10, 2).notNullable();
    table.decimal('current_debt', 10, 2).notNullable().defaultTo(0);
    table.decimal('apr', 5, 2).notNullable();
    table.date('due_date');
    table.integer('payoff_period_months');
    table.boolean('autopay_enabled').notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('cards');
};
