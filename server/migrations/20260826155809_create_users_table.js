/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    //primary key | Postgres has a native UUID generator
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    /** Other Keys
     * .notNullable() PG rejects inserts that leave those columns empty
     * .unique() Database says "no duplicates allowed"
     * .defaultTo() sets default value
     * 
     */
    table.string('username').notNullable().unique();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.integer('default_payoff_months').defaultTo(30);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
