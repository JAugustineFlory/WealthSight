const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile').development);
const checkAuth = require('../middleware/checkAuth');

/**----------------------------- */
//gets for cards
router.get('/', checkAuth, async (req, res) => {
    try {
        const cards = await knex('cards').where({ user_id: req.userId });
        res.status(200).json(cards);
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

router.get('/:id', checkAuth, async (req, res) => {//pull :id from url
    try {
        const card = await knex('cards')
            .where({ id: req.params.id, user_id: req.userId })//Security detail | Only shows cards that belong to user/match id and user_id before showing card
            .first(); 

        if (!card) {
            //if user tries to access someone else's card or a non-existent card, throw the ol' 404
            return res.status(404).json({ message: 'Card not found' });
        }

        res.status(200).json(card);
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

/**------------------------------- */
//POST for cards
router.post('/', checkAuth, async (req, res) => {
    try {
        const {
            nickname,
            organization,
            credit_limit,
            current_debt,
            apr,
            due_date,
            payoff_period_months,
            autopay_enabled,
        } = req.body;

        const [newCard] = await knex('cards')
            .insert({
                user_id: req.userId,
                nickname,
                organization,
                credit_limit,
                current_debt,
                apr,
                due_date,
                payoff_period_months,
                autopay_enabled,
            })
            .returning('*');

        res.status(201).json(newCard);
    } catch (err) {
        res.status(400).json({ message: `Error: ${err}` });
    }
});

/**------------------------------- */
//PUT | card updates
router.put('/:id', checkAuth, async (req, res) => {
    try {
        const {
            nickname,
            organization,
            credit_limit,
            current_debt,
            apr,
            due_date,
            payoff_period_months,
            autopay_enabled,
        } = req.body;

        const [updatedCard] = await knex('cards')
            //same check as in get. Verify requested id matches user id
            .where({ id: req.params.id, user_id: req.userId })
            .update({//
                nickname,
                organization,
                credit_limit,
                current_debt,
                apr,
                due_date,
                payoff_period_months,
                autopay_enabled,
            })
            .returning('*');

        if(!updatedCard) {
            return res.status(404).json({ message: 'Card not found' });
        }

        res.status(200).json(updatedCard);
    } catch (err) {
        res.status(400).json({ message: `Error: ${err}` });
    }
});


/**---------------------- */
//DELETE
router.delete('/:id', checkAuth, async (req, res) => {
    try {
        const deletedCount = await knex('cards')
            .where({ id: req.params.id, user_id: req.userId })
            .del(); //returns count of rows deleted

        if (!deletedCount) {//if where() didn't find anything, returns 404
            return res.status(404).json({ message: 'Card not found' });
        }

        res.status(204).send();//successful delete
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

module.exports = router;