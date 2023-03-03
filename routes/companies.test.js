process.env.NODE_ENV = "test";

const request = require("supertest")
const app = require("../app")
const db = require("../db")

let testCompany;

beforeEach(async function () {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('bjam', 'B-Jam', 'advanced high school analytics') RETURNING code, name, description`);
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
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({"company": testCompany})
    })
})


describe("POST /companies", () => {
    test("Create a company", async () => {
        const newCompany = {"code": "sill", "name": "Silly Company", "description": "a super silly company"}
        const res = await request(app).post("/companies").send(newCompany);
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({"company": newCompany })
    })
})

describe("PATCH /companies/:code", () => {
    test("Edit a company by code", async () => {
        const bjamEdits = {"name": "B-Jam 2.0", "description": "advanced high school and junior college analytics"}
        const res = await request(app).patch(`/companies/${testCompany.code}`).send(bjamEdits);
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            "company": 
            {
                "code": testCompany.code, 
                "name": bjamEdits.name, 
                "description": bjamEdits.description
            }
        })
    })
})

describe("DELETE/companies/:code", () => {
    test("Delete company by code", async () => {
        const res = await request(app).delete("/companies/:code")
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ msg: 'DELETED!' })
    })
})