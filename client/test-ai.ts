async function testGeneratePlan() {
  const res = await fetch("http://localhost:3000/api/generate-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal: "I want to build discipline and get stronger" }),
  });

  const data = await res.json();
  console.log("✅ AI Response:", data);
}

testGeneratePlan();