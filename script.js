document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const resultDiv = document.getElementById("result");
  const statusDiv = document.getElementById("status");
  const spinBtn = document.getElementById("spinBtn");
  const resetBtn = document.getElementById("resetBtn");
  const newNameInput = document.getElementById("newNameInput");
  const addNameBtn = document.getElementById("addNameBtn");
  const yesNoBtn = document.getElementById("yesNoBtn");

  let names = [];
  let firstName = null;
  let spinning = false;
  let startAngle = Math.random() * 2 * Math.PI;
  let arc = 0;

  // ✅ Grøn (Yes) og Crimson (No)
  const baseColors = ["#66FF00", "#DC143C"];

  function setStatus(msg) { statusDiv.textContent = msg || ""; }

  function arrangeNames(list) {
    if (list.length <= 1) return list.slice();
    for (let attempt = 0; attempt < 500; attempt++) {
      list.sort(() => Math.random() - 0.5);
      if (list.every((n, i) => n !== list[(i + 1) % list.length])) return list;
    }
    return list;
  }

  function getWheelColors(n) {
    return Array.from({ length: n }, (_, i) => baseColors[i % baseColors.length]);
  }

  function drawWheel(highlightIndex = null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!names.length) return;

    arc = (2 * Math.PI) / names.length;
    const wheelColors = getWheelColors(names.length);

    names.forEach((name, i) => {
      const angle = startAngle + i * arc;
      ctx.fillStyle = wheelColors[i];
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, angle, angle + arc);
      ctx.closePath();
      ctx.fill();

      if (highlightIndex === i) {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "16px Arial";
      ctx.fillText(name, canvas.width / 2 - 10, 10);
      ctx.restore();
    });

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 15, 0);
    ctx.lineTo(canvas.width / 2 + 15, 0);
    ctx.lineTo(canvas.width / 2, 30);
    ctx.closePath();
    ctx.fill();
  }

  function rotateWheel() {
    const minDuration = 5000; // minimum 5 seconds
    const duration = minDuration + Math.random() * 4000; // 5–9 seconds
    const decelTime = 3000 + Math.random() * 2000;       // 3–5 seconds deceleration
    const startTime = performance.now();
    const endTime = startTime + duration;
    const decelStart = endTime - decelTime;

    function step(now) {
      if (now >= endTime) {
        spinning = false;
        if (!names.length) return;

        const pointerAngle = -Math.PI / 2;
        let adjusted = (pointerAngle - (startAngle % (2 * Math.PI))) % (2 * Math.PI);
        if (adjusted < 0) adjusted += 2 * Math.PI;
        const index = Math.floor(adjusted / arc);
        const chosen = names[index];

        resultDiv.textContent = "🎉 The wheel landed on: " + chosen;
        setStatus("");
        return;
      }

      let speed;
      if (now < decelStart) {
        speed = 0.3;
      } else {
        const decelProgress = (now - decelStart) / decelTime;
        speed = 0.3 * Math.pow(1 - decelProgress, 3);
      }

      startAngle += speed;
      drawWheel();
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  spinBtn.addEventListener("pointerup", () => {
    if (!spinning && names.length) {
      spinning = true;
      setStatus("⏳ Spinning…");
      rotateWheel();
    } else if (!names.length) {
      setStatus("Add names first.");
    }
  });

  resetBtn.addEventListener("pointerup", () => {
    names = [];
    firstName = null;
    resultDiv.textContent = "";
    setStatus("The wheel has been reset.");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startAngle = Math.random() * 2 * Math.PI;
    yesNoBtn.classList.remove("disabled");
    yesNoBtn.disabled = false;
  });

  function addName(n) {
    if (spinning) return setStatus("You cannot add names while the wheel is spinning.");
    if (!firstName) firstName = n;
    names.push(n);
    names = arrangeNames(names);
    drawWheel();
  }

  // Yes/No button toggles 3× Yes and 3× No
  yesNoBtn.addEventListener("pointerup", () => {
    if (yesNoBtn.disabled) {
      // Remove Yes and No (up to 3 each)
      let countYes = 0, countNo = 0;
      names = names.filter(n => {
        if (n === "Yes" && countYes < 3) { countYes++; return false; }
        if (n === "No" && countNo < 3) { countNo++; return false; }
        return true;
      });
      names = arrangeNames(names);
      drawWheel();
      setStatus("Removed Yes and No ×3");
      yesNoBtn.classList.remove("disabled");
      yesNoBtn.disabled = false;
    } else {
      // Add 3× Yes and 3× No
      for (let i = 0; i < 3; i++) {
        addName("Yes");
        addName("No");
      }
      setStatus("Added Yes and No ×3");
      yesNoBtn.classList.add("disabled");
      yesNoBtn.disabled = true;
    }
  });

  addNameBtn.addEventListener("pointerup", () => {
    const n = (newNameInput.value || "").trim();
    if (!n) return setStatus("Enter a name.");
    if (["Yes","No"].some(fn => fn.toLowerCase() === n.toLowerCase())) {
      return setStatus("Name already exists as Yes/No.");
    }
    addName(n);
    newNameInput.value = "";
    setStatus(`Added: ${n}`);
  });

  drawWheel();
  setStatus("The wheel starts empty. Add names with the Yes/No button or the input field.");
});
