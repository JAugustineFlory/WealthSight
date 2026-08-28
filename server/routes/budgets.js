const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile').development);
const checkAuth = require('../middleware/checkAuth');

/**---------------------------------- */
//## GET  ##

//Verify Authorization | budgets belongs to user
router.get('/', checkAuth, async (req, res) => {
    try {
        const budgets = await knex('budgets').where({ user_id: req.userId });
        res.status(200).json(budgets);
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

router.get('/:id', checkAuth, async (req, res) => {
    try {
        const budgets = await knex('budgets')
            .where({ id: req.params.id, user_id: req.userId })
            .first();

        if (!budgets) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.status(200).json(budgets);
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

/**------------------------------ */
//POST for budgets
router.post('/', checkAuth, async (req, res) => {
    try {
        const {
            monthly_limit,
            month_year,
            category_id,
        } = req.body;

        if (category_id) {
            const categoryBelongsToUser = await knex('categories')
                .where({ id: category_id, user_id: req.userId })
                .first();

            if (!categoryBelongsToUser) {
                return res.status(400).json({ message: 'Invalid category_id' });
            }
        }

        const [newBudget] = await knex('budgets')
            .insert({
                user_id: req.userId,
                monthly_limit,
                month_year,
                category_id,
            })
            .returning('*');

        res.status(201).json(newBudget);
    } catch (err) {
        res.status(400).json({ message: `Error: ${err}` });
    }
});

/**---------------------------------------------- */
//##  PUT  ##
router.put('/:id', checkAuth, async (req, res) => {
    try {
        const {
            monthly_limit,
            month_year,
            category_id,
        } = req.body;

        if (category_id) {
            const categoryBelongsToUser = await knex('categories')
                .where({ id: category_id, user_id: req.userId })
                .first();

            if(!categoryBelongsToUser) {
                return res.status(400).json({ message: 'Invalid category_id' });
            }
        }

        const [updatedBudgets] = await knex('budgets')
            .where({ id: req.params.id, user_id: req.userId })
            .update({
                monthly_limit,
                month_year,
                category_id,
            })
            .returning('*')

        if(!updatedBudgets) {
            return res.status(404).json({ message: 'Budget entry not found'});
        }

        res.status(200).json(updatedBudgets);
    } catch (err) {
        res.status(400).json({ message: `Error: ${err}` });
    }
});

/**--------------------------------------------*/
// ## DELETE ##
router.delete('/:id', checkAuth, async (req, res) => {
    try {
        const deletedCount = await knex('budgets')
            .where({ id: req.params.id, user_id: req.userId })
            .del();

        if (!deletedCount) {
            return res.status(404).json({ message: 'Budget entry not found' });
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});



module.exports = router;