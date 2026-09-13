const assert=require('node:assert/strict');
const engine=require('./engine.js');
const deck=require('./slime.json');
for(const route of ['分析溪水','询问信使','沿岸寻找工具']){
 const save={character:{name:'露米',talent:'感知'},messages:[{role:'assistant',turn:structuredClone(deck.opening)}]};
 for(let n=0;n<4;n++){
  const before=structuredClone(save);
  const turn=engine.offlineTurn(save,route);
  assert.deepEqual(save,before,'engine must not mutate a save');
  if(n<3)engine.validateTurn(turn);
  save.messages.push({role:'user',text:route},{role:'assistant',turn});
 }
 assert.equal(save.messages.at(-1).turn.choices.length,0);
 assert.ok(save.messages.at(-1).turn.state.inventory.includes('简易森林地图'));
 const context=engine.buildContext(deck,save,'魔素');
 assert.ok(context.entries.includes('魔素与初生技能'));
 assert.equal(context.messages.at(-1).role,'user');
 assert.ok(context.messages.some(m=>m.role==='user'&&m.content.includes(route)),'past player choices retained');
}
assert.throws(()=>engine.parseTurn('{"story":"bad"}'));
const bad=structuredClone(deck.opening);bad.state.hp=-2;assert.throws(()=>engine.validateTurn(bad));
assert.deepEqual(engine.parseTurn('```json\n'+JSON.stringify(deck.opening)+'\n```'),deck.opening);
console.log('Three routes, non-mutating state, history, worldbook and response validation passed.');
