const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db")


router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT code, field FROM industries ORDER BY code')

        const results_2 = await db.query(
            `SELECT i.field, c.code
             FROM industries as i
             LEFT JOIN departments as dept
             ON i.code = dept.industry_code
             LEFT JOIN companies AS c
             ON dept.company_code = c.code`
            );

        // console.log('i am results_2 rows', results_2.rows)

        // not sure how to implement logic to match company codes to industry and the solution provided by SB does not include this logic

        x = results_2.rows
        const y = x.filter(a => a.code === "apple");

        console.log('i am y', y)

        return res.json({industries: results.rows})
    } catch (e) {
        return next(e)
    }
})

// associates an industry to a company
router.get('/:industry_code/:company_code', async (req, res, next) => {
    try {
        const { industry_code, company_code  } = req.params

        const results = await db.query(
            `SELECT c.name, i.field
             FROM industries as i
             LEFT JOIN departments as dept
             ON i.code = dept.industry_code
             LEFT JOIN companies AS c
             ON dept.company_code = c.code
             WHERE i.code = $1 AND c.code = $2`, [industry_code, company_code]
            );
        return res.send({Company_Department: results.rows[0]})
    }
    catch(e) {
        return next(e)
    }
}) 


router.post('/', async (req, res, next) => {
    try {
        const { code, field} = req.body
        const results = await db.query('INSERT INTO industries( code, field) VALUES ($1, $2) RETURNING code, field', [code, field])
        return res.status(201).json({invoice: results.rows[0]})
    } catch (e) {
        return next(e)
    }
})

module.exports = router;