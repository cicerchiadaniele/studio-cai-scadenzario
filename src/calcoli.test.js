// Test dei calcoli: node src/calcoli.test.js
import assert from 'node:assert/strict'
import * as C from './calcoli.js'
const r = C.d('2026-10-06')
const carisi = { id: 'c1', Condominio: 'Don Rua 37', Conduttore: 'Carisi', 'Tipo contratto': 'Uso diverso 6+6', Decorrenza: '2015-12-15', 'Durata primo periodo (anni)': 6, 'Durata rinnovo (anni)': 6, 'Preavviso disdetta (mesi)': 6, 'Canone iniziale annuo': 5400, 'Canone attuale annuo': 6171, ISTAT: '75%', 'Ultimo adeguamento ISTAT': '2021-12-15', 'Imposta di registro': 'Annuale', Stato: 'Attivo' }
assert.equal(C.iso(C.prossimaFine(carisi, r).data), '2027-12-14')
const istat = C.mappaIstat([{ fields: { Mese: '2022-11', 'Variazione annua %': 11.5 } }, { fields: { Mese: '2023-11', 'Variazione annua %': 0.7 } }, { fields: { Mese: '2024-11', 'Variazione annua %': 1.2 } }, { fields: { Mese: '2025-11', 'Variazione annua %': 1.0 } }])
const a = C.adeguamentiIstat(carisi, istat, r)
assert.equal(a.righe.length, 4)
assert.equal(a.righe[0].decorrenza, '2022-12-15')
assert.equal(a.righe[0].aumento, C.arrot(6171 * 0.115 * 0.75))
const sc = C.scadenzeContratto(carisi, istat, r)
const dis = sc.find((x) => x.chiave === 'c1-disdetta')
assert.equal(dis.data, '2027-06-14')
assert.equal(sc.find((x) => x.chiave === 'c1-istat').data, '2026-12-15')
assert.equal(sc.find((x) => x.chiave === 'c1-registro').data, '2027-01-14')
// 4+4 Pistoia: primo periodo finito 31/05/2026 -> prossima fine 31/05/2030
const pist = { id: 'p', Decorrenza: '2022-06-01', 'Durata primo periodo (anni)': 4, 'Durata rinnovo (anni)': 4 }
const pf = C.prossimaFine(pist, r)
assert.equal(C.iso(pf.data), '2030-05-31'); assert.equal(pf.indice, 1)
// IMU: A/3 rendita 503,55, aliquota 11,4 per mille
const im = { id: 'i', Condominio: 'X', 'Categoria catastale': 'A/3', 'Rendita catastale': 503.55 }
const al = [{ fields: { Anno: 2026, Tipologia: 'Altri fabbricati', 'Aliquota (per mille)': 11.4 } }, { fields: { Anno: 2026, Tipologia: 'Gruppo D', 'Aliquota (per mille)': 10.6 } }]
const imu = C.imuImmobile(im, [], al, 2026)
assert.equal(imu.base, C.arrot(503.55 * 1.05 * 160))
assert.equal(imu.imposta, C.arrot(C.arrot(503.55 * 1.05 * 160) * 11.4 / 1000))
const imuC = C.imuImmobile(im, [{ Stato: 'Attivo', 'Tipo contratto': 'Abitativo 3+2 concordato' }], al, 2026)
assert.equal(imuC.imposta, C.arrot(imu.imposta * 0.75))
assert.equal(C.moltiplicatore('C/1'), 55); assert.equal(C.moltiplicatore('A/10'), 80); assert.equal(C.moltiplicatore('C/2 (probabile)'), 160); assert.equal(C.moltiplicatore('D/8'), 65)
assert.equal(C.imuImmobile(im, [], al, 2027).aliquotaStimata, true)
console.log('Tutti i test superati', imu)
