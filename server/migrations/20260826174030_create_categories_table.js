/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('categories', (table) => {
    //Primary key | Again uses PG's uuid
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    /**Other Keys
     * .references().inTable enables the foreign key, or using keys from other tables
     * .onDelete('CASCADE')
     * - CASCADE auto-deletes related tables if a user is deleted
     *  - otherwise all tables would need to be deleted before a user could be
     */
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    //Type verification safety net
    table.string('type').notNullable();
    //Allows only 'income' and 'expense' to be entered into 'type' column
    table.check('?? IN (?, ?)', ['type', 'income', 'expense']);

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('categories');
};
