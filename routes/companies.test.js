process.env.NODE_ENV = "test";

const request = require("supertest")
const app = require("./app")
const db = require("./db")

let testCompany;

beforeEach(async function () {
    const result = await db.query(`INSERT INTO companies (name, description) VALUES ('B-Jam', 'advanced high school analytics') RETURNING code, name, description`);
    testCompany = result.rows[0]
})

afterEach(async function () {
    await db.query('DELETE FROM companies')
})

afterAll(async () => {
    await db.end()
})

describe("GET /companies", () => {
    test("Get all companies", async () => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({"companies": [testCompany]})
    })
})

describe("GET /companies/:code", () => {
    test("Gets a single company by code", async () => {
        const res = await request(app).get(`/companies/${testCompany.id}`);
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            "company": 
            {
                "code": "", 
                "name": "", 
                "description": ""
            }
        })
    })
})


describe("POST /companies", () => {
    test("Create a company", async () => {
        const res = await request(app).get("/companies").send({"name": "bread", "price": 1.99});
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({"company": testCompany})
    })
})

describe("PATCH /companies/:code", () => {
    test("Edit a company by code", async () => {
        const res = await request(app).get("/companies").send({"name": "bread", "price": 1.99});
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            "company": 
            {
                "code": "", 
                "name": "", 
                "description": ""
            }
        })
    })
})

describe("DELETE/companies/:code", () => {
    test("Delete company by code", async () => {
        const res = await request(app).delete("/companies/:code")
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({status: "deleted"})
    })
})