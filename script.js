const $ = (id) => document.getElementById(id)
const meals = JSON.parse(localStorage.getItem('diet_meals') || '[]')

const FOOD_DB = {
  '닭가슴살': { kcal: 165, carb: 0, protein: 31, fat: 3.6 },
  '고구마': { kcal: 128, carb: 30, protein: 1.6, fat: 0.2 },
  '현미밥': { kcal: 160, carb: 34, protein: 3.2, fat: 1.1 },
  '계란': { kcal: 78, carb: 0.6, protein: 6.3, fat: 5.3 },
  '연어': { kcal: 208, carb: 0, protein: 20, fat: 13 },
  '바나나': { kcal: 89, carb: 23, protein: 1.1, fat: 0.3 },
  '그릭요거트': { kcal: 97, carb: 3.6, protein: 9, fat: 5 },
  '두부': { kcal: 76, carb: 1.9, protein: 8, fat: 4.8 },
  '샐러드': { kcal: 33, carb: 6, protein: 2, fat: 0.4 },
  '아보카도': { kcal: 160, carb: 9, protein: 2, fat: 15 },
}

function saveMeals() { localStorage.setItem('diet_meals', JSON.stringify(meals)) }

function calcCalories() {
  const h = Number($('height').value || 0)
  const w = Number($('weight').value || 0)
  const age = Number($('age').value || 0)
  const sex = $('sex').value
  const act = Number($('activity').value || 1.2)
  const goal = $('goal').value
  if (!h || !w || !age) return $('calorieResult').textContent = '성별/나이/키/체중을 입력해 주세요.'

  // 전문가식 Mifflin-St Jeor
  const bmr = sex === 'male'
    ? 10 * w + 6.25 * h - 5 * age + 5
    : 10 * w + 6.25 * h - 5 * age - 161

  let tdee = bmr * act
  if (goal === 'cut') tdee -= 450
  if (goal === 'bulk') tdee += 300

  const protein = Math.round(goal === 'cut' ? w * 2.0 : w * 1.8)
  const fat = Math.round(w * 0.8)
  const carb = Math.max(0, Math.round((tdee - protein * 4 - fat * 9) / 4))

  $('calorieResult').textContent = `권장: ${Math.round(tdee)} kcal (BMR ${Math.round(bmr)}) / 탄수 ${carb}g · 단백질 ${protein}g · 지방 ${fat}g`
}

function renderMeals() {
  const body = $('mealBody')
  body.innerHTML = meals.map((m, i) => `
    <tr>
      <td>${m.type}</td>
      <td>${m.name}</td>
      <td>${m.kcal}</td>
      <td>${m.carb}/${m.protein}/${m.fat}</td>
      <td><button onclick="removeMeal(${i})">삭제</button></td>
    </tr>
  `).join('')

  const sum = meals.reduce((a, m) => ({
    kcal: a.kcal + Number(m.kcal || 0),
    carb: a.carb + Number(m.carb || 0),
    protein: a.protein + Number(m.protein || 0),
    fat: a.fat + Number(m.fat || 0),
  }), { kcal: 0, carb: 0, protein: 0, fat: 0 })

  $('sumKcal').textContent = sum.kcal
  $('sumMacro').textContent = `${sum.carb} / ${sum.protein} / ${sum.fat} g`
}

window.removeMeal = (idx) => {
  meals.splice(idx, 1)
  saveMeals(); renderMeals()
}

function autoFillByFoodName() {
  const name = ($('foodName').value || '').trim()
  if (!name) return

  let found = null
  for (const key of Object.keys(FOOD_DB)) {
    if (name.includes(key)) { found = FOOD_DB[key]; break }
  }

  if (!found) {
    $('foodHint').textContent = 'DB에 없는 음식입니다. 칼로리/탄단지를 수동 입력해 주세요.'
    return
  }

  $('foodKcal').value = found.kcal
  $('foodCarb').value = found.carb
  $('foodProtein').value = found.protein
  $('foodFat').value = found.fat
  $('foodHint').textContent = `자동입력 완료: ${Math.round(found.kcal)}kcal 기준`
}

;['goal','sex','age','height','weight','activity'].forEach((id) => {
  $(id).addEventListener('input', calcCalories)
  $(id).addEventListener('change', calcCalories)
})

$('foodName').addEventListener('change', autoFillByFoodName)
$('foodName').addEventListener('blur', autoFillByFoodName)

$('mealForm').addEventListener('submit', (e) => {
  e.preventDefault()
  meals.push({
    type: $('mealType').value,
    name: $('foodName').value,
    kcal: Number($('foodKcal').value || 0),
    carb: Number($('foodCarb').value || 0),
    protein: Number($('foodProtein').value || 0),
    fat: Number($('foodFat').value || 0),
  })
  saveMeals(); renderMeals(); e.target.reset()
})

$('weeklyTemplate').innerHTML = [
  '월/수/금: 고단백(닭,계란,두부) + 저GI 탄수(현미/고구마)',
  '화/목: 채소량 확대 + 간식(그릭요거트/견과)',
  '토: 외식 1회 허용(총칼로리 내)',
  '일: 주간 점검 + 장보기 리셋',
].map(x => `<li>${x}</li>`).join('')

renderMeals()
calcCalories()