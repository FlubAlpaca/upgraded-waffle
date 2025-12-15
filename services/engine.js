const { create, get, set } = require("./sessionStore");
const { aiParse, aiQuestion } = require("./llm");
const { collateForHandlebars, renderTemplate, convertHtmlToDoc } = require("./generation");
const { PROMPTS } = require("./prompts");
const { TEMPLATE } = require("./template");
const { TESTS } = require("./data");
const path = require("path");

async function startSession() { return await create(); }

async function getSession(id) {
  return await get(id);
}

async function submitAnswer(sessionId, userText) {
   const s = await get(sessionId);
   if(!s){
      const err = new Error("not found");
      err.status = 404;
      return err;
   }
   s.messageHistory.push(userText);
   await set(s.id, {messageHistory: [...s.messageHistory]});
   const messages = [
    {role: "system", content: PROMPTS[0]}, //Response Parse System Prompt
    {role: "user", content: `Variables: ${JSON.stringify(s.variables, null, 2)} Required Variables: ${JSON.stringify(s.requiredVariables, null, 2)} Flags: ${JSON.stringify(s.flags, null, 2)} Required Flags: ${JSON.stringify(s.requiredFlags, null, 2)} Message History ${JSON.stringify(s.messageHistory, null, 2)} Current Question: ${JSON.stringify(s.lastQuestion, null, 2)}, User input: ${JSON.stringify(userText, null, 2)}`}    
   ]
   const ai = await aiParse(messages);

   let item;
   for (const [field,value] of Object.entries(ai.updates.variables)){
     item = s.requiredVariables.find(v => v.field === field);
     if (item) item.value = value;
     item = s.variables.find(v => v.field === field);
     if (item) item.value = value;
   }

   await set(s.id, {
     requiredVariables: s.requiredVariables,
     variables: s.variables,
   });

   for (const [field,value] of Object.entries(ai.updates.flags)){
     item = s.requiredFlags.find(v => v.field === field);
     if (item) item.value = value;
     item = s.flags.find(v => v.field === field);
     if (item) item.value = value;
   }
   await set(s.id, {
     requiredFlags: s.requiredFlags,
     flags: s.flags,
   });
   return getNextQuestion(sessionId);

}

async function getNextQuestion(id){
   const s = await get(id);
   if(!s){
      const err = new Error("not found");
      err.status = 404;
      return err;
   }
   const messages = [
    {role: "system", content: PROMPTS[1]},
    {role: "user", content: `Variables: ${JSON.stringify(s.variables, null, 2)} Required Variables: ${JSON.stringify(s.requiredVariables, null, 2)} Flags: ${JSON.stringify(s.flags, null, 2)} Required Flags: ${JSON.stringify(s.requiredFlags, null, 2)} Message History ${JSON.stringify(s.messageHistory, null, 2)} Last Question: ${JSON.stringify(s.lastQuestion, null, 2)}`},
   ]
   const data = await aiQuestion(messages);

   if (data.Done == "true"){
      await generateWill(s.id);
   }
   s.lastQuestion = data.Question;
   await set(s.id, {lastQuestion: data.Question});
   s.messageHistory.push(data.Question);
   await set(s.id, {messageHistory: [...s.messageHistory]});
   return data;
}

async function generateWill(id){
  const s = await get(id);
  if(!s){
    const err = new Error("not found");
    err.status = 404;
    return err;
  }
  flattened = collateForHandlebars(s);
  const tplPath = path.join(__dirname, "..", "templates", "will.hbs");
  const outPath = path.join(__dirname, "..", "out", "will.html");
  await renderTemplate(tplPath, flattened, outPath);
  await convertHtmlToDoc(outPath);
}

async function testGen(number){
  const tplPath = path.join(__dirname, "..", "templates", "will.hbs");
  const outPath = path.join(__dirname, "..", "out", "will.html");
  await renderTemplate(tplPath, TESTS[number], outPath);
  await convertHtmlToDoc(outPath);
}


module.exports = { startSession, submitAnswer, getNextQuestion, testGen, getSession, generateWill };
