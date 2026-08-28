const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile').development);
const checkAuth = require('../middleware/checkAuth');

/**---------------------------------- */
//## GET  ##

//Verify Authorization | categories belongs to user
router.get('/', checkAuth, async (req, res) => {
    try {
        const categories = await knex('categories').where({ user_id: req.userId });
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

router.get('/:id', checkAuth, async (req, res) => {
    try {
        const categories = await knex('categories')
            .where({ id: req.params.id, user_id: req.userId })
            .first();

        if (!categories) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

/**------------------------------ */
//POST for categories
router.post('/', checkAuth, async (req, res) => {
    try {
        const {
            name,
            type,
        } = req.body;

        const [newCategory] = await knex('categories')
            .insert({
                user_id: req.userId,
                name,
                type,
            })
            .returning('*');

        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: `Error: ${err}` });
    }
});

/**---------------------------------------------- */
//##  PUT  ##
router.put('/:id', checkAuth, async (req, res) => {
    try {
        const {
            name,
            type,
        } = req.body;

        const [updatedCategories] = await knex('categories')
            .where({ id: req.params.id, user_id: req.userId })
            .update({
                name,
                type,
            })
            .returning('*')

        if(!updatedCategories) {
            return res.status(404).json({ message: 'Category entry not found'});
        }

        res.status(200).json(updatedCategories);
    } catch (err) {
        res.status(400).json({ message: `Error: ${err}` });
    }
});

/**--------------------------------------------*/
// ## DELETE ##
router.delete('/:id', checkAuth, async (req, res) => {
    try {
        const deletedCount = await knex('categories')
            .where({ id: req.params.id, user_id: req.userId })
            .del();

        if (!deletedCount) {
            return res.status(404).json({ message: 'Category entry not found' });
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});



module.exports = router;