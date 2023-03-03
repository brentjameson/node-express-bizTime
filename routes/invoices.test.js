process.env.NODE_ENV = "test";

const request = require("supertest")
const app = require("../app")
const db = require("../db")

let testCompany;
let testInvoice;

beforeEach(async function () {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('bjam', 'B-Jam', 'advanced high school analytics') RETURNING code, name, description`);
    testCompany = result.rows[0]
})

beforeEach(async function () {
    const result = await db.query(`INSERT INTO invoices (comp_code, amt, add_date) VALUES ('bjam', 100, '2023-03-02') RETURNING id, comp_code, amt, paid, add_date, paid_date`);
    // result.rows[0].add_date = String(result.rows[0].add_date)
    testInvoice = result.rows[0]
})

afterEach(async function () {
    await db.query('DELETE FROM companies')
    await db.query('DELETE FROM invoices')
})

afterAll(async () => {
    await db.end()
})

describe("GET /invoices", () => {
    test("Get all invoices", async () => {
        console.log('i am test invoice',testInvoice)
        const res = await request(app).get("/invoices");
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({"invoices": [{id: testInvoice.id, comp_code: testInvoice.comp_code}]})
    })
})

describe("GET /invoices/:id", () => {
    test("Gets a single company by code", async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            "invoice": {
              id: testInvoice.id,
              comp_code: testInvoice.comp_code,
              amt: testInvoice.amt,
              add_date: "2023-03-02T05:00:00.000Z",
              paid: testInvoice.paid,
              paid_date: testInvoice.paid_date
            }
        })
    })
})


describe("POST /invoices", () => {
    test("Create an invoice", async () => {
        const newInvoice = {
            id: testInvoice.id + 1,
            comp_code: testInvoice.comp_code,
            amt: testInvoice.amt,
            add_date: expect.any(String),
            paid: testInvoice.paid,
            paid_date: testInvoice.paid_date
          }
        const res = await request(app).post("/invoices").send(newInvoice);
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({"invoice": newInvoice })
    })
})

describe("PATCH /invoices/:id", () => {
    test("Edit an invoice by id", async () => {
        const res = await request(app).patch(`/invoices/${testInvoice.id}`).send({amt: testInvoice.amt + 100, paid: true});
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            "invoice": 
            {
                id: testInvoice.id,
                comp_code: testInvoice.comp_code,
                amt: testInvoice.amt + 100,
                add_date: expect.any(String),
                paid: true,
                paid_date: expect.any(String)
              }
        })
    })
})

describe("DELETE/invoices/:id", () => {
    test("Delete an invoice by id", async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ msg: 'DELETED!' })
    })
})