const $ = (id) => document.getElementById(id)
const meals = JSON.parse(localStorage.getItem('diet_meals') || '[]')

function saveMeals() { localStorage.setItem('diet_meals', JSON.stringify(meals)) }

function calcCalories() {
  const h = Number($('height').value || 0)
  const w = Number($('weight').value || 0)
  const act = Number($('activity').value || 1.2)
  const goal = $('goal').value
  if (!h || !w) return $('calorieResult').textContent = '키/체중을 입력해 주세요.'

  // 간단 추정(BMR 대체): 체중*22
  let tdee = w * 22 * act
  if (goal === 'cut') tdee -= 350
  if (goal === 'bulk') tdee += 300
  const protein = Math.round(w * 1.8)
  const fat = Math.round(w * 0.8)
  const carb = Math.round((tdee - protein * 4 - fat * 9) / 4)

  $('calorieResult').textContent = `권장: ${Math.round(tdee)} kcal / 탄수 ${carb}g · 단백질 ${protein}g · 지방 ${fat}g`
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

$('calcBtn').addEventListener('click', calcCalories)
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