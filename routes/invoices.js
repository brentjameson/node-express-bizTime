const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db")

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT id, comp_code FROM invoices ORDER BY id')
        return res.json({invoices: results.rows})
    } catch (e) {
        return next(e)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id])
        if(results.rows.length === 0) {
            throw new ExpressError(`Cannot find invoice with id of ${id}`, 404)
        }
        return res.send({invoice: results.rows[0]})
    }
    catch(e) {
        return next(e)
    }
}) 


router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt} = req.body
        const results = await db.query('INSERT INTO invoices ( comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt])
        return res.status(201).json({invoice: results.rows[0]})
    } catch (e) {
        return next(e)
    }
})

// If paying unpaid invoice: sets paid_date to today
// If un-paying: sets paid_date to null
// Else: keep current paid_date
// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let { amt, paid } = req.body
        let paidDate = null;

        const currentResults = await db.query('UPDATE invoices SET amt=$1, paid=$2 WHERE id = $3 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, paid, id])

        if (currentResults.rows.length === 0) {
            throw new ExpressError(`Can't find an invoice with id of ${id}`, 404)
        }

        const currentPaidDate = currentResults.rows[0].paid_date

        if (!currentPaidDate && paid) {
            paidDate = new Date()
        } else if (!paid) {
            paidDate = null
        } else {
            paidDate = currentPaidDate
        }

        const results = await db.query('UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id = $4 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, paid, paidDate, id])

        
        return res.send({ invoice: results.rows[0]})
    }
    catch(e) {
        return next(e)

    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const results = db.query('DELETE FROM invoices WHERE id = $1', [req.params.id])
        console.log(req.params.id, 'req.params.id')
        return res.send({ msg: 'DELETED!' })
    }
    catch(e){
        return next(e)
    }
})

module.exports = router;