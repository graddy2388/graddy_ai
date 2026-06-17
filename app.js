const models = [
  {
    id: "openai",
    name: "OpenAI",
    provider: "OpenAI",
    description: "Strong general reasoning, agents, multimodal work, and structured problem solving.",
    stats: ["Reasoning", "Agents", "Vision"],
    cost: 0.04,
    latency: 7.8,
    avatarClass: "avatar-openai",
    spriteClass: "sprite-openai",
    selected: true,
  },
  {
    id: "claude",
    name: "Claude",
    provider: "Anthropic",
    description: "Best for careful analysis, writing polish, long explanations, and review passes.",
    stats: ["Writing", "Analysis", "Review"],
    cost: 0.03,
    latency: 6.6,
    avatarClass: "avatar-claude",
    spriteClass: "sprite-claude",
    selected: true,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    provider: "DeepSeek",
    description: "Useful for coding, reasoning-heavy drafts, and cost-conscious exploration.",
    stats: ["Coding", "Budget", "Logic"],
    cost: 0.01,
    latency: 8.3,
    avatarClass: "avatar-deepseek",
    spriteClass: "sprite-deepseek",
    selected: true,
  },
  {
    id: "copilot",
    name: "Copilot",
    provider: "GitHub",
    description: "A natural fit for repo-aware coding, workflow help, and implementation loops.",
    stats: ["Repo", "Coding", "Flow"],
    cost: 0.02,
    latency: 6.1,
    avatarClass: "avatar-copilot",
    spriteClass: "sprite-copilot",
    selected: false,
  },
  {
    id: "groq",
    name: "Groq",
    provider: "Groq",
    description: "Fast responses for quick chat, drafts, lightweight coding, and routing previews.",
    stats: ["Speed", "Chat", "Low cost"],
    cost: 0.01,
    latency: 2.2,
    avatarClass: "avatar-groq",
    spriteClass: "sprite-groq",
    selected: true,
  },
  {
    id: "cohere",
    name: "Cohere",
    provider: "Cohere",
    description: "Good for retrieval, classification, enterprise workflows, and document pipelines.",
    stats: ["RAG", "Classify", "Docs"],
    cost: 0.02,
    latency: 5.9,
    avatarClass: "avatar-cohere",
    spriteClass: "sprite-cohere",
    selected: false,
  },
  {
    id: "mistral",
    name: "Mistral",
    provider: "Mistral AI",
    description: "Efficient open-model option for multilingual work and fast everyday tasks.",
    stats: ["Efficient", "Open", "Language"],
    cost: 0.02,
    latency: 4.8,
    avatarClass: "avatar-mistral",
    spriteClass: "sprite-mistral",
    selected: false,
  },
  {
    id: "google",
    name: "Google AI Studio",
    provider: "Google",
    description: "Gemini access for long context, vision, multimodal files, and experiments.",
    stats: ["Context", "Vision", "Gemini"],
    cost: 0.02,
    latency: 5.4,
    avatarClass: "avatar-google",
    spriteClass: "sprite-google",
    selected: false,
  },
];

const routeSelections = {
  balanced: ["openai", "claude", "deepseek", "groq"],
  fast: ["groq", "mistral", "google"],
  deep: ["openai", "claude", "deepseek", "google"],
  budget: ["deepseek", "groq", "mistral"],
};

const modelList = document.querySelector("#modelList");
const selectedCount = document.querySelector("#selectedCount");
const tileSelectedSummary = document.querySelector("#tileSelectedSummary");
const selectedRoster = document.querySelector("#selectedRoster");
const activeMetric = document.querySelector("#activeMetric");
const costMetric = document.querySelector("#costMetric");
const latencyMetric = document.querySelector("#latencyMetric");
const responseList = document.querySelector("#responseList");
const runStatus = document.querySelector("#runStatus");
const promptForm = document.querySelector("#promptForm");
const promptInput = document.querySelector("#promptInput");
const routeButtons = document.querySelectorAll(".route-pill");
const navButtons = document.querySelectorAll(".nav-item");
const compareToggle = document.querySelector("#compareToggle");
const selectRecommended = document.querySelector("#selectRecommended");
const selectAllButton = document.querySelector("#selectAllButton");
const clearSelectionButton = document.querySelector("#clearSelectionButton");
const multiSelectToggle = document.querySelector("#multiSelectToggle");
const newPromptButton = document.querySelector("#newPromptButton");
const exportButton = document.querySelector("#exportButton");

let currentRoute = "balanced";
let sessionRuns = [];
let multiSelectEnabled = true;

const viewTargets = {
  console: document.querySelector(".prompt-panel"),
  models: document.querySelector(".selector-panel"),
  routes: document.querySelector(".route-panel"),
  history: document.querySelector(".output-panel"),
};

function selectedModels() {
  return models.filter((model) => model.selected);
}

function modelById(id) {
  return models.find((model) => model.id === id);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function selectedLabel(count) {
  return `${count} model${count === 1 ? "" : "s"} selected`;
}

function updateSelectionState(ids) {
  const selectedIds = new Set(ids);
  models.forEach((model) => {
    model.selected = selectedIds.has(model.id);
  });
  renderModelTiles();
  updateSelectionSummary();
}

function updateSelectionSummary() {
  const active = selectedModels();
  const cost = active.reduce((total, model) => total + model.cost, 0);
  const latency = active.length ? active.reduce((max, model) => Math.max(max, model.latency), 0) : 0;
  const summary = selectedLabel(active.length);

  selectedCount.textContent = summary;
  tileSelectedSummary.textContent = summary;
  activeMetric.textContent = active.length;
  costMetric.textContent = formatCurrency(cost);
  latencyMetric.textContent = `${latency.toFixed(1)}s`;
  selectedRoster.textContent = active.length ? active.map((model) => model.name).join(", ") : "No models selected";
}

function createSpan(className, text) {
  const span = document.createElement("span");

  span.className = className;

  if (text !== undefined) {
    span.textContent = text;
  }

  return span;
}

function renderAvatar(model) {
  const avatar = createSpan(`pixel-avatar ${model.avatarClass}`);
  const room = createSpan(`pixel-room ${model.spriteClass}`);
  const character = createSpan("pixel-character");
  const body = createSpan("pixel-body");

  avatar.setAttribute("aria-hidden", "true");
  body.appendChild(createSpan("pixel-body-detail"));
  character.append(
    createSpan("pixel-hat"),
    createSpan("pixel-hair"),
    createSpan("pixel-head"),
    createSpan("pixel-arm pixel-arm-left"),
    createSpan("pixel-arm pixel-arm-right"),
    body,
    createSpan("pixel-feet"),
  );
  room.append(
    createSpan("pixel-sign", model.name.slice(0, 2).toUpperCase()),
    createSpan("pixel-shadow"),
    character,
  );
  avatar.append(createSpan("pixel-skyline"), createSpan("pixel-sidewalk"), room);

  return avatar;
}

function renderModelTile(model) {
  const tile = document.createElement("button");
  const modelCopy = createSpan("model-copy");
  const titleRow = createSpan("model-title-row");
  const title = document.createElement("strong");
  const provider = document.createElement("small");
  const description = createSpan("model-description", model.description);
  const tags = createSpan("model-tags");
  const selectionCheck = createSpan("selection-check");

  tile.className = `model-tile${model.selected ? " selected" : ""}`;
  tile.type = "button";
  tile.dataset.modelId = model.id;
  tile.setAttribute("aria-pressed", String(model.selected));
  selectionCheck.setAttribute("aria-hidden", "true");

  title.textContent = model.name;
  provider.textContent = model.provider;
  titleRow.append(title, provider);

  model.stats.forEach((stat) => {
    tags.appendChild(createSpan("model-tag", stat));
  });

  modelCopy.append(titleRow, description, tags);
  tile.append(selectionCheck, renderAvatar(model), modelCopy);

  return tile;
}

function renderModelTiles() {
  modelList.replaceChildren(...models.map(renderModelTile));
}

function toggleModelSelection(modelId) {
  const model = modelById(modelId);

  if (!model) {
    return;
  }

  if (multiSelectEnabled) {
    model.selected = !model.selected;
    updateSelectionState(selectedModels().map((item) => item.id));
    return;
  }

  const shouldDeselect = model.selected && selectedModels().length === 1;
  updateSelectionState(shouldDeselect ? [] : [model.id]);
}

function setRoute(route) {
  currentRoute = route;
  routeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.route === route);
  });
  compareToggle.checked = route === "compare";

  if (routeSelections[route]) {
    updateSelectionState(routeSelections[route]);
  }
}

function buildSimulatedResponse(model, prompt, taskType) {
  const routeCopy = {
    balanced: "balanced route",
    fast: "fast route",
    deep: "deep analysis route",
    compare: "comparison route",
    budget: "budget route",
  }[currentRoute];

  return `${model.name} would receive this as a ${taskType} task through the ${routeCopy}. The connector layer is not wired yet, so this response is a placeholder for the actual API result. Prompt preview: "${prompt.slice(0, 130)}${prompt.length > 130 ? "..." : ""}"`;
}

function createResponseCard(model, responseText) {
  const card = document.createElement("article");
  const header = document.createElement("header");
  const title = document.createElement("h4");
  const provider = document.createElement("span");
  const body = document.createElement("p");

  card.className = "response-card";
  provider.className = "model-meta";
  title.textContent = model.name;
  provider.textContent = model.provider;
  body.textContent = responseText;

  header.append(title, provider);
  card.append(header, body);

  return card;
}

function createEmptyState(titleText, messageText) {
  const emptyState = document.createElement("article");
  const title = document.createElement("h4");
  const message = document.createElement("p");

  emptyState.className = "empty-state";
  title.textContent = titleText;
  message.textContent = messageText;
  emptyState.append(title, message);

  return emptyState;
}

function renderResponses(prompt, taskType) {
  const active = selectedModels();

  responseList.replaceChildren();

  if (!active.length) {
    responseList.appendChild(createEmptyState("No models selected", "Choose at least one model from the selector before running the prompt."));
    runStatus.textContent = "Waiting";
    return;
  }

  runStatus.textContent = compareToggle.checked || currentRoute === "compare" ? "Comparing" : "Complete";

  active.forEach((model) => {
    responseList.appendChild(createResponseCard(model, buildSimulatedResponse(model, prompt, taskType)));
  });

  sessionRuns.unshift({
    prompt,
    taskType,
    route: currentRoute,
    models: active.map((model) => model.name),
    createdAt: new Date().toISOString(),
  });
}

function downloadSessionPayload(payload) {
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `model-console-session-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function exportSession(payload) {
  try {
    await navigator.clipboard.writeText(payload);
    runStatus.textContent = "Session copied";
    return;
  } catch (clipboardError) {
    try {
      downloadSessionPayload(payload);
      runStatus.textContent = "Session downloaded";
    } catch (downloadError) {
      runStatus.textContent = "Export blocked";
    }
  }
}

function setActiveView(view) {
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  viewTargets[view]?.scrollIntoView({ behavior: "smooth", block: "start" });
}

modelList.addEventListener("click", (event) => {
  const tile = event.target.closest(".model-tile");

  if (tile) {
    toggleModelSelection(tile.dataset.modelId);
  }
});

routeButtons.forEach((button) => {
  button.addEventListener("click", () => setRoute(button.dataset.route));
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveView(button.dataset.view));
});

selectRecommended.addEventListener("click", () => {
  setRoute("balanced");
});

selectAllButton.addEventListener("click", () => {
  updateSelectionState(models.map((model) => model.id));
});

clearSelectionButton.addEventListener("click", () => {
  updateSelectionState([]);
});

multiSelectToggle.addEventListener("change", () => {
  multiSelectEnabled = multiSelectToggle.checked;

  if (!multiSelectEnabled && selectedModels().length > 1) {
    updateSelectionState([selectedModels()[0].id]);
  }
});

newPromptButton.addEventListener("click", () => {
  promptInput.value = "";
  promptInput.focus();
  runStatus.textContent = "Ready";
});

exportButton.addEventListener("click", async () => {
  const payload = JSON.stringify({ runs: sessionRuns }, null, 2);
  await exportSession(payload);
});

promptForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  const taskType = document.querySelector("#taskType").value;

  if (!prompt) {
    promptInput.focus();
    runStatus.textContent = "Prompt needed";
    return;
  }

  runStatus.textContent = "Routing";
  window.setTimeout(() => renderResponses(prompt, taskType), 320);
});

renderModelTiles();
updateSelectionSummary();
