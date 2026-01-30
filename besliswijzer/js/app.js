// =============================================================================
// REST Besliswijzer - Interactive Application
// =============================================================================

// -- THEME TOGGLE --
(function () {
    const saved = localStorage.getItem('theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    updateToggleUI();
})();

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateToggleUI();
}

function updateToggleUI() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const label = document.querySelector('.theme-label');
    if (label) label.textContent = isDark ? 'Light' : 'Dark';
}

// -- TAB NAVIGATION --
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const tabId = link.dataset.tab;

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
    });
});

// -- METHOD SELECTOR --
const methodData = {
    GET: {
        title: 'Data ophalen (read)',
        badge: 'get',
        info: [
            { label: 'Gebruik', value: 'Resources opvragen. Data wordt alleen gelezen, niet gewijzigd.' },
            { label: 'Body', value: 'Nee' },
            { label: 'Idempotent', value: 'Ja - herhaalde calls geven hetzelfde resultaat' },
            { label: 'Safe', value: 'Ja - geen side effects' },
            { label: 'Collectie', value: '200 OK (ook bij lege array [])' },
            { label: 'Singleton', value: '200 OK of 404 Not Found' },
            { label: 'Paging', value: '206 Partial Content bij _limit/_offset' },
            { label: 'Caching', value: '304 Not Modified met ETag/If-None-Match' },
        ],
        warn: 'Privacy gevoelige informatie mag niet in de GET URI string. Gebruik POST indien nodig (MFF BAS ID08).'
    },
    HEAD: {
        title: 'Metadata/headers ophalen',
        badge: 'head',
        info: [
            { label: 'Gebruik', value: 'Identiek aan GET maar zonder response body. Alleen headers.' },
            { label: 'Body', value: 'Nee' },
            { label: 'Idempotent', value: 'Ja' },
            { label: 'Safe', value: 'Ja' },
            { label: 'Success', value: '200 OK (geen body)' },
            { label: 'Caching', value: '304 Not Modified met ETag/If-None-Match' },
        ],
        warn: null
    },
    POST: {
        title: 'Resource aanmaken (server bepaalt ID)',
        badge: 'post',
        info: [
            { label: 'Gebruik', value: 'Nieuwe resource aanmaken. Server genereert het ID.' },
            { label: 'Body', value: 'Ja - JSON payload verplicht' },
            { label: 'Idempotent', value: 'Nee - herhaalde calls maken meerdere resources' },
            { label: 'Safe', value: 'Nee' },
            { label: 'Success', value: '201 Created + Location header met URI' },
            { label: 'Async', value: '202 Accepted voor asynchrone verwerking' },
            { label: 'Complex search', value: 'POST mag ook voor uitgebreide zoekopdrachten (MFF BAS ID09)' },
        ],
        warn: 'Bulk delete: gebruik POST met body (DELETE heeft geen body). Response: 202 Accepted.'
    },
    PUT: {
        title: 'Resource vervangen/aanmaken (client bepaalt ID)',
        badge: 'put',
        info: [
            { label: 'Gebruik', value: 'Volledige resource vervangen. Ook create als resource nog niet bestaat.' },
            { label: 'Body', value: 'Ja - volledige resource representatie' },
            { label: 'Idempotent', value: 'Ja - herhaalde calls geven hetzelfde resultaat' },
            { label: 'Safe', value: 'Nee' },
            { label: 'Create', value: '201 Created (of 204 No Content)' },
            { label: 'Update', value: '200 OK (of 204 No Content)' },
        ],
        warn: 'PUT kan een resource creeren, maar dit verdient niet de voorkeur. Location header verplicht bij creatie.'
    },
    PATCH: {
        title: 'Resource deels wijzigen',
        badge: 'patch',
        info: [
            { label: 'Gebruik', value: 'Gedeeltelijke update. Alleen gewijzigde velden meesturen.' },
            { label: 'Body', value: 'Ja - alleen de te wijzigen velden' },
            { label: 'Idempotent', value: 'Nee' },
            { label: 'Safe', value: 'Nee' },
            { label: 'Success', value: '200 OK (of 204 No Content)' },
        ],
        warn: null
    },
    DELETE: {
        title: 'Resource verwijderen',
        badge: 'delete',
        info: [
            { label: 'Gebruik', value: 'Een specifieke resource verwijderen.' },
            { label: 'Body', value: 'Nee - gebruik POST voor bulk delete' },
            { label: 'Idempotent', value: 'Ja' },
            { label: 'Safe', value: 'Nee' },
            { label: 'Success', value: '204 No Content (standaard)' },
            { label: 'Met body', value: '200 OK als response data nodig is (optioneel)' },
        ],
        warn: 'DELETE heeft geen body. Voor bulk delete: gebruik POST /resource/bulk-delete met ids in body.'
    }
};

function showMethod(method) {
    const data = methodData[method];
    const result = document.getElementById('method-result');
    const badge = document.getElementById('method-badge');
    const title = document.getElementById('method-title');
    const details = document.getElementById('method-details');

    badge.className = `method-badge badge ${data.badge}`;
    badge.textContent = method;
    title.textContent = data.title;

    let html = '<ul class="method-info">';
    data.info.forEach(item => {
        html += `<li><span class="label">${item.label}:</span> ${item.value}</li>`;
    });
    if (data.warn) {
        html += `<li class="warn">${data.warn}</li>`;
    }
    html += '</ul>';
    details.innerHTML = html;

    result.classList.remove('hidden');

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.method === method);
    });
}

// -- DECISION TREE --
const treeSteps = [
    {
        id: 'auth',
        question: 'Heeft de gebruiker een geldig token?',
        context: 'Check authenticatie (OAuth2 / OpenID Connect - MFF BAS ID15)',
        yes: 'authz',
        no: { code: 401, name: 'Unauthorized', desc: 'Authenticatie vereist of token ongeldig/verlopen.', category: 'client-error' }
    },
    {
        id: 'authz',
        question: 'Heeft de gebruiker recht op deze actie?',
        context: 'Check autorisatie op basis van rol en permissies',
        yes: 'syntax',
        no: { code: 403, name: 'Forbidden', desc: 'Gebruiker is geauthenticeerd maar niet geautoriseerd voor deze actie.', category: 'client-error' }
    },
    {
        id: 'syntax',
        question: 'Is de body of query syntactisch correct?',
        context: 'JSON Schema validatie (MFF BAS ID11). Let op: path fouten zijn altijd 404, niet 400!',
        yes: 'semantic',
        no: { code: 400, name: 'Bad Request', desc: 'Syntactische fout in body of query parameters. Path fouten zijn ALTIJD 404.', category: 'client-error' }
    },
    {
        id: 'semantic',
        question: 'Is de body semantisch correct?',
        context: 'Alleen bij POST/PUT/PATCH. GET, HEAD en DELETE hebben geen body dus geen 422.',
        yes: 'exists',
        no: { code: 422, name: 'Unprocessable Entity', desc: 'Semantische validatiefout in body. Alleen bij methods met body (POST/PUT/PATCH).', category: 'client-error' }
    },
    {
        id: 'exists',
        question: 'Bestaat de resource (of heeft de gebruiker toegang)?',
        context: 'Resource lookup op basis van path parameters',
        yes: 'system',
        no: { code: 404, name: 'Not Found', desc: 'Resource bestaat niet of path is ongeldig.', category: 'client-error' }
    },
    {
        id: 'system',
        question: 'Werkt het onderliggende systeem correct?',
        context: 'Backend systemen, databases, externe services. Altijd x-correlation-id meegeven!',
        yes: 'caching',
        no: { code: 500, name: 'Internal Server Error', desc: 'Systeemfout. x-correlation-id is verplicht voor tracing (MFF BAS ID20).', category: 'server-error' }
    },
    {
        id: 'caching',
        question: 'Wordt er caching gebruikt en is de resource ongewijzigd?',
        context: 'Alleen voor GET/HEAD met ETag/If-None-Match',
        yes: { code: 304, name: 'Not Modified', desc: 'Resource is ongewijzigd. Client kan cache gebruiken.', category: 'redirect' },
        no: 'paging'
    },
    {
        id: 'paging',
        question: 'Wordt er paging gebruikt? (_limit/_offset)',
        context: 'Alleen voor GET collecties met paginering',
        yes: { code: 206, name: 'Partial Content', desc: 'Gedeeltelijke data bij paging. Response bevat data[] en total.', category: 'success' },
        no: 'method-type'
    },
    {
        id: 'method-type',
        question: 'Welke HTTP method gebruik je?',
        context: 'Success status code verschilt per method',
        options: [
            { label: 'GET / HEAD', result: { code: 200, name: 'OK', desc: 'Resource succesvol opgehaald. Lege collectie is ook 200.', category: 'success' } },
            { label: 'POST create', result: { code: 201, name: 'Created', desc: 'Resource aangemaakt. Location header bevat URI van nieuwe resource.', category: 'success' } },
            { label: 'PUT update', result: { code: 200, name: 'OK', desc: 'Resource succesvol vervangen. 204 No Content als geen body terug hoeft.', category: 'success' } },
            { label: 'PATCH', result: { code: 200, name: 'OK', desc: 'Resource succesvol gewijzigd. 204 No Content als geen body terug hoeft.', category: 'success' } },
            { label: 'DELETE', result: { code: 204, name: 'No Content', desc: 'Resource succesvol verwijderd. 200 OK als response data nodig is.', category: 'success' } },
            { label: 'POST search', result: { code: 200, name: 'OK', desc: 'Zoekresultaten opgehaald (MFF BAS ID09 - complex search).', category: 'success' } },
        ]
    }
];

let currentStepIndex = 0;
let treeHistory = [];

function renderTreeStep() {
    const step = treeSteps[currentStepIndex];
    const container = document.getElementById('tree-step');
    const resultEl = document.getElementById('tree-result');
    const historyEl = document.getElementById('tree-history');
    const resetBtn = document.getElementById('tree-reset');

    resultEl.classList.add('hidden');
    container.style.display = 'block';

    if (step.options) {
        let html = `<p class="step-question">${step.question}</p>`;
        html += `<p class="step-context">${step.context}</p>`;
        html += '<div class="step-options">';
        step.options.forEach((opt, i) => {
            html += `<button class="step-btn" onclick="finishTree(${i})">${opt.label}</button>`;
        });
        html += '</div>';
        container.innerHTML = html;
    } else {
        let html = `<p class="step-question">${step.question}</p>`;
        html += `<p class="step-context">${step.context}</p>`;
        html += '<div class="step-options">';
        html += `<button class="step-btn yes" onclick="treeAnswer(true)">Ja</button>`;
        html += `<button class="step-btn no" onclick="treeAnswer(false)">Nee</button>`;
        html += '</div>';
        container.innerHTML = html;
    }

    // Render history
    let histHtml = '';
    treeHistory.forEach(h => {
        histHtml += `<div class="history-item">
            <span class="hi-q">${h.question}</span>
            <span class="hi-a ${h.answer}">${h.answerText}</span>
        </div>`;
    });
    historyEl.innerHTML = histHtml;

    resetBtn.classList.toggle('hidden', treeHistory.length === 0);
}

function treeAnswer(isYes) {
    const step = treeSteps[currentStepIndex];

    treeHistory.push({
        question: step.question,
        answer: isYes ? 'yes' : 'no',
        answerText: isYes ? 'Ja' : 'Nee'
    });

    const next = isYes ? step.yes : step.no;

    if (typeof next === 'object') {
        showTreeResult(next);
    } else {
        currentStepIndex = treeSteps.findIndex(s => s.id === next);
        renderTreeStep();
    }
}

function finishTree(optionIndex) {
    const step = treeSteps[currentStepIndex];
    const opt = step.options[optionIndex];

    treeHistory.push({
        question: step.question,
        answer: 'yes',
        answerText: opt.label
    });

    showTreeResult(opt.result);
}

function showTreeResult(result) {
    const container = document.getElementById('tree-step');
    const resultEl = document.getElementById('tree-result');
    const historyEl = document.getElementById('tree-history');
    const resetBtn = document.getElementById('tree-reset');

    container.style.display = 'none';

    resultEl.className = `tree-result ${result.category}`;
    resultEl.innerHTML = `
        <div class="result-code">${result.code}</div>
        <div class="result-name">${result.name}</div>
        <div class="result-desc">${result.desc}</div>
    `;
    resultEl.classList.remove('hidden');

    // Render final history
    let histHtml = '';
    treeHistory.forEach(h => {
        histHtml += `<div class="history-item">
            <span class="hi-q">${h.question}</span>
            <span class="hi-a ${h.answer}">${h.answerText}</span>
        </div>`;
    });
    historyEl.innerHTML = histHtml;

    resetBtn.classList.remove('hidden');
}

function resetTree() {
    currentStepIndex = 0;
    treeHistory = [];
    renderTreeStep();
}

// Initialize decision tree
renderTreeStep();

// -- STATUS CODE CARDS --
function toggleCard(card) {
    card.classList.toggle('open');
}

// -- EXAMPLE SELECTOR --
function showExample(id) {
    document.querySelectorAll('.example-content').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    document.querySelectorAll('.example-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}
