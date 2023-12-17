const express = require("express");

const app = express();

const path = require("path");

const dbpath = path.join(__dirname, "covid19India.db");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
app.use(express.json());
let db = null;

const InitializeDBServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("the server running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
  }
};

InitializeDBServer();

let datareturn = (dbObj) => {
  return {
    stateId: dbObj.state_id,
    stateName: dbObj.state_name,
    population: dbObj.population,
  };
};

let datareturnTwo = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

let datareturnTwoSum = (dbObject) => {
  return {
    totalCases: dbObject.cases,
    totalCured: dbObject.cured,
    totalActive: dbObject.active,
    totalDeaths: dbObject.deaths,
  };
};

app.get("/states/", async (request, response) => {
  let get_all_query = `SELECT * FROM state ORDER BY state_id ASC;`;
  let all_result = await db.all(get_all_query);
  respondResult = all_result.map((eachState) => {
    return datareturn(eachState);
  });
  response.send(respondResult);
});

app.get("/states/:stateId/", async (request, response) => {
  let { stateId } = request.params;
  const get_query = `SELECT * FROM state WHERE state_id=${stateId};`;
  let get_result = await db.get(get_query);
  response.send(datareturn(get_result));
});

app.post("/districts/", async (request, response) => {
  let { districtName, stateId, cases, cured, active, deaths } = request.body;
  let insert_query = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths) VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;

  await db.run(insert_query);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;
  let get_query_dis = `SELECT * FROM district WHERE district_id=${districtId};`;
  let get_result_dis = await db.get(get_query_dis);
  response.send(datareturnTwo(get_result_dis));
});

app.delete("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;
  let del_query_dis = `DELETE FROM district WHERE district_id=${districtId};`;
  await db.get(del_query_dis);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;
  let { districtName, stateId, cases, cured, active, deaths } = request.body;
  let upd_query_dis = `UPDATE district SET district_name='${districtName}', state_id=${stateId}, cases=${cases}, cured=${cured}, active=${active}, deaths=${deaths} WHERE district_id=${districtId};`;
  await db.get(del_query_dis);
  response.send(`District Details Updated`);
});

app.get("/states/:stateId/stats/", async (request, response) => {
  let { stateId } = request.params;
  let get_query = `SELECT SUM(cases),SUM(cured),SUM(active),SUM(deaths) FROM district WHERE state_id=${stateId};`;
  let get_result = await db.get(get_query);
  response.send(datareturnTwoSum(get_result));
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    select state_id from district
    where district_id = ${districtId};
    `; //With this we will get the state_id using district table
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);
  const getStateNameQuery = `
    select state_name as stateName from state
    where state_id = ${getDistrictIdQueryResponse.state_id};
    `; //With this we will get state_name as stateName using the state_id
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(datareturn(getStateNameQueryResponse));
});
module.exports = app;
