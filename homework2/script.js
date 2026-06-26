/* =====================================================
   script.js — Zaveri's Clinic Homework 2
   All validation "modules" / subroutines live here and are
   wired up to fields and buttons in patient-form.html.
   Relies on STATE_LIST from states.js (loaded first).

   Each field has its own validate___() function. They are
   called both individually (on blur, for instant feedback)
   and together (from validateAll(), for Review/Submit) so
   the validation logic only lives in one place.
   ===================================================== */

document.addEventListener('DOMContentLoaded', initForm);

function initForm() {
  populateStates();
  setDateRanges();
  document.getElementById('year').textContent = new Date().getFullYear();

  // dynamic event: slider value updates live as you drag it
  document.getElementById('incomeSlider').addEventListener('input', updateIncomeDisplay);
  updateIncomeDisplay();

  // dynamic event: password checklist + match, checked as you type
  const pwd = document.getElementById('password');
  const pwd2 = document.getElementById('password2');
  pwd.addEventListener('focus', showPasswordChecklist);
  pwd.addEventListener('input', updatePasswordChecklist);
  pwd.addEventListener('blur', function () {
    validatePassword();
    hidePasswordChecklistIfEmpty();
  });
  pwd2.addEventListener('input', confirmPasswordMatch);
  pwd2.addEventListener('blur', confirmPasswordMatch);

  // instant feedback on blur for every text/date/email/tel/select field
  const blurFields = [
    ['firstName', validateFirstName],
    ['mi', validateMi],
    ['lastName', validateLastName],
    ['dob', validateDob],
    ['apptDate', validateApptDate],
    ['insDate', validateInsDate],
    ['patientId', validatePatientId],
    ['email', validateEmailField],
    ['phone', validatePhoneField],
    ['addr1', validateAddr1],
    ['addr2', validateAddr2],
    ['city', validateCity],
    ['state', validateStateField],
    ['zip', validateZipField],
    ['userId', validateUserId]
  ];
  blurFields.forEach(function (pair) {
    document.getElementById(pair[0]).addEventListener('blur', pair[1]);
  });

  // radio groups: clear their error the moment a choice is made
  ['insurance', 'vaccinated', 'visitType'].forEach(function (groupName) {
    document.querySelectorAll('input[name="' + groupName + '"]').forEach(function (radio) {
      radio.addEventListener('change', function () { setError(groupName, ''); });
    });
  });

  document.getElementById('symptoms').addEventListener('blur', validateSymptoms);

  document.getElementById('reviewBtn').addEventListener('click', handleReview);
  document.getElementById('regForm').addEventListener('submit', handleSubmit);
  document.getElementById('startOverBtn').addEventListener('click', handleStartOver);
  document.getElementById('clearReviewBtn').addEventListener('click', handleClearReview);
}

/* ---------- module: state drop-down (from external states.js file) ---------- */
function populateStates() {
  const sel = document.getElementById('state');
  STATE_LIST.forEach(function (s) {
    const opt = document.createElement('option');
    opt.value = s.code;
    opt.textContent = s.name + ' (' + s.code + ')';
    sel.appendChild(opt);
  });
}

/* ---------- module: calculate min/max date ranges off today's date ---------- */
function setDateRanges() {
  const today = new Date();
  const todayISO = toISODate(today);

  const minDobDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  document.getElementById('dob').min = toISODate(minDobDate);
  document.getElementById('dob').max = todayISO;

  document.getElementById('apptDate').min = todayISO;
  document.getElementById('insDate').min = todayISO;
}

function toISODate(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

function formatDateForReview(iso) {
  if (!iso) return '';
  const parts = iso.split('-');
  return parts[1] + '/' + parts[2] + '/' + parts[0]; // MM/DD/YYYY
}

/* ---------- module: slider live display ---------- */
function updateIncomeDisplay() {
  const val = Number(document.getElementById('incomeSlider').value);
  document.getElementById('incomeDisplay').textContent = '$' + val.toLocaleString('en-US');
}

/* ---------- module: helpers for radio / checkbox groups ---------- */
function getRadioValue(name) {
  const checked = document.querySelector('input[name="' + name + '"]:checked');
  return checked ? checked.value : null;
}

function getCheckedBoxes(name) {
  return Array.from(document.querySelectorAll('input[name="' + name + '"]:checked'))
    .map(function (cb) { return cb.value; });
}

function clearAllErrors() {
  document.querySelectorAll('.errMsg').forEach(function (e) {
    e.textContent = '';
    e.classList.remove('ok');
  });
}

function setError(id, msg, isOk) {
  const span = document.getElementById('err-' + id);
  if (!span) return;
  span.textContent = msg || '';
  span.classList.toggle('ok', !!isOk && !!msg);
}

/* =====================================================
   Per-field validators.
   Each one reads the field, sets its error span, and
   returns { ok, value } so it can be reused everywhere.
   ===================================================== */

function validateFirstName() {
  const el = document.getElementById('firstName');
  const ok = el.checkValidity();
  setError('firstName', ok ? '' : 'Letters, apostrophes, dashes only (1-30 chars).');
  return { ok: ok, value: el.value };
}

function validateMi() {
  const el = document.getElementById('mi');
  const ok = el.checkValidity();
  setError('mi', ok ? '' : 'One letter only.');
  return { ok: ok, value: el.value };
}

function validateLastName() {
  const el = document.getElementById('lastName');
  const ok = el.checkValidity();
  setError('lastName', ok ? '' : "Letters, apostrophes, numbers 2-5, dashes only (1-30 chars).");
  return { ok: ok, value: el.value };
}

function validateDob() {
  const el = document.getElementById('dob');
  const ok = el.checkValidity() && el.value !== '';
  setError('dob', ok ? '' : 'Required; not in the future, not more than 120 years ago.');
  return { ok: ok, value: el.value };
}

function validateApptDate() {
  const el = document.getElementById('apptDate');
  const ok = el.checkValidity() && el.value !== '';
  setError('apptDate', ok ? '' : 'Required; must be today or later.');
  return { ok: ok, value: el.value };
}

function validateInsDate() {
  const el = document.getElementById('insDate');
  const ok = el.checkValidity() && el.value !== '';
  setError('insDate', ok ? '' : 'Required; must be today or later.');
  return { ok: ok, value: el.value };
}

function validatePatientId() {
  const el = document.getElementById('patientId');
  const ok = el.checkValidity();
  setError('patientId', ok ? '' : 'Must be 9 digits, format 123-45-6789.');
  return { ok: ok, value: el.value };
}

function validateEmailField() {
  const el = document.getElementById('email');
  const ok = el.checkValidity();
  setError('email', ok ? '' : 'Format: name@domain.tld');
  return { ok: ok, value: el.value };
}

function validatePhoneField() {
  const el = document.getElementById('phone');
  const ok = el.checkValidity();
  setError('phone', ok ? '' : 'Format: 000-000-0000');
  return { ok: ok, value: el.value };
}

function validateAddr1() {
  const el = document.getElementById('addr1');
  const ok = el.checkValidity();
  setError('addr1', ok ? '' : 'Required, 2-30 characters.');
  return { ok: ok, value: el.value };
}

function validateAddr2() {
  const el = document.getElementById('addr2');
  const ok = el.checkValidity();
  setError('addr2', ok ? '' : '2-30 characters if entered.');
  return { ok: ok, value: el.value };
}

function validateCity() {
  const el = document.getElementById('city');
  const ok = el.checkValidity();
  setError('city', ok ? '' : 'Required, 2-30 characters.');
  return { ok: ok, value: el.value };
}

function validateStateField() {
  const el = document.getElementById('state');
  const ok = el.checkValidity() && el.value !== '';
  setError('state', ok ? '' : 'Please choose a state.');
  return { ok: ok, value: el.value };
}

function validateZipField() {
  const el = document.getElementById('zip');
  const ok = el.checkValidity();
  setError('zip', ok ? '' : '5 digits, or Zip+4 like 77002-1234.');
  return { ok: ok, value: el.value };
}

function validateSymptoms() {
  const el = document.getElementById('symptoms');
  const ok = !el.value.includes('"');
  setError('symptoms', ok ? '' : 'Please remove double-quote characters.');
  return { ok: ok, value: el.value };
}

function validateUserId() {
  const el = document.getElementById('userId');
  const ok = el.checkValidity();
  setError('userId', ok ? '' : '5-30 chars, start with a letter, then letters/numbers/_/-, no spaces.');
  return { ok: ok, value: el.value };
}

/* ---------- module: password requirement checklist (live, on input) ---------- */
function passwordRequirementChecks() {
  const pwd = document.getElementById('password').value;
  const userId = document.getElementById('userId').value.toLowerCase();
  const first = document.getElementById('firstName').value.toLowerCase();
  const last = document.getElementById('lastName').value.toLowerCase();
  const lower = pwd.toLowerCase();

  const containsId = (userId && userId.length > 0 && lower.includes(userId)) ||
                      (first && first.length > 1 && lower.includes(first)) ||
                      (last && last.length > 1 && lower.includes(last));

  return {
    length: pwd.length >= 8 && pwd.length <= 30,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    digit: /\d/.test(pwd),
    special: /[!@#%^&*()\-_+=\\/><.,`~]/.test(pwd) && !pwd.includes('"'),
    noid: !containsId
  };
}

function showPasswordChecklist() {
  document.getElementById('pwdChecklist').classList.add('show');
  updatePasswordChecklist();
}

function hidePasswordChecklistIfEmpty() {
  if (document.getElementById('password').value === '') {
    document.getElementById('pwdChecklist').classList.remove('show');
  }
}

function updatePasswordChecklist() {
  const checks = passwordRequirementChecks();
  toggleChecklistItem('pwReq-length', checks.length);
  toggleChecklistItem('pwReq-upper', checks.upper);
  toggleChecklistItem('pwReq-lower', checks.lower);
  toggleChecklistItem('pwReq-digit', checks.digit);
  toggleChecklistItem('pwReq-special', checks.special);
  toggleChecklistItem('pwReq-noid', checks.noid);
}

function toggleChecklistItem(id, met) {
  document.getElementById(id).classList.toggle('met', met);
}

function validatePassword() {
  const el = document.getElementById('password');
  const checks = passwordRequirementChecks();
  const ok = el.checkValidity() && checks.noid;
  setError('password', ok ? '' : (checks.noid ? 'Check the requirements below.' : 'Cannot contain your name or User ID.'));
  return { ok: ok, value: el.value, checks: checks };
}

/* ---------- module: confirm-password match, checked live ---------- */
function confirmPasswordMatch() {
  const pwd = document.getElementById('password').value;
  const pwd2 = document.getElementById('password2').value;

  if (!pwd2) {
    setError('password2', '');
    return { ok: false, value: pwd2 };
  }
  if (pwd !== pwd2) {
    setError('password2', 'Passwords do not match.');
    return { ok: false, value: pwd2 };
  }
  setError('password2', 'Passwords match.', true);
  return { ok: true, value: pwd2 };
}

/* ---------- module: full-form validation, used by both Review and Submit ---------- */
function validateAll() {
  clearAllErrors();
  const data = [];

  // --- Name ---
  const first = validateFirstName();
  const mi = validateMi();
  const last = validateLastName();
  const nameOk = first.ok && mi.ok && last.ok;
  const fullName = [first.value, mi.value, last.value].filter(Boolean).join(' ');
  data.push({ label: 'First, MI, Last Name', value: fullName, ok: nameOk, msg: nameOk ? 'pass' : 'ERROR: check name formatting' });

  // --- Dates ---
  const dob = validateDob();
  data.push({ label: 'Date of Birth', value: formatDateForReview(dob.value), ok: dob.ok, msg: dob.ok ? 'pass' : 'ERROR: Invalid date of birth' });

  const appt = validateApptDate();
  data.push({ label: 'Preferred Appointment Date', value: formatDateForReview(appt.value), ok: appt.ok, msg: appt.ok ? 'pass' : 'ERROR: Must be today or a future date' });

  const ins = validateInsDate();
  data.push({ label: 'Insurance Effective Date', value: formatDateForReview(ins.value), ok: ins.ok, msg: ins.ok ? 'pass' : 'ERROR: Must be today or a future date' });

  // --- Patient ID / SSN ---
  const pid = validatePatientId();
  data.push({
    label: 'Patient ID #',
    value: pid.value ? '•••-••-' + pid.value.replace(/[^0-9]/g, '').slice(-4) : '',
    ok: pid.ok,
    msg: pid.ok ? 'pass' : 'ERROR: Invalid Patient ID / SSN format'
  });

  // --- Contact ---
  const email = validateEmailField();
  data.push({ label: 'Email address', value: email.value, ok: email.ok, msg: email.ok ? 'pass' : 'ERROR: Invalid email format' });

  const phone = validatePhoneField();
  data.push({ label: 'Phone number', value: phone.value, ok: phone.ok, msg: phone.ok ? 'pass' : 'ERROR: Invalid phone format' });

  // --- Address ---
  const addr1 = validateAddr1();
  const addr2 = validateAddr2();
  const city = validateCity();
  const state = validateStateField();
  const zip = validateZipField();
  const addrOk = addr1.ok && addr2.ok && city.ok && state.ok && zip.ok;
  let addrMsg = 'pass';
  if (!addr1.ok) addrMsg = 'ERROR: Address Line 1 required (2-30 chars)';
  else if (!addr2.ok) addrMsg = 'ERROR: Address Line 2 must be 2-30 chars if entered';
  else if (!city.ok) addrMsg = 'ERROR: City required (2-30 chars)';
  else if (!state.ok) addrMsg = 'ERROR: Please choose a state';
  else if (!zip.ok) addrMsg = 'ERROR: Zip must be 5 digits, or Zip+4';

  const truncatedZip = zip.value.split('-')[0];
  const addrDisplay = [addr1.value, addr2.value, [city.value, state.value, truncatedZip].filter(Boolean).join(', ')]
    .filter(Boolean).join('  /  ');
  data.push({ label: 'Address', value: addrDisplay, ok: addrOk, msg: addrMsg });

  // --- Checkboxes / radios ---
  const conditions = getCheckedBoxes('conditions');
  data.push({ label: 'Conditions checked', value: conditions.length ? conditions.join(', ') : 'None selected', ok: true, msg: 'pass' });

  const insurance = getRadioValue('insurance');
  const insuranceOk = !!insurance;
  if (!insuranceOk) setError('insurance', 'Please choose an insurance status.');
  data.push({ label: 'Insurance status', value: insurance || '', ok: insuranceOk, msg: insuranceOk ? 'pass' : 'ERROR: Please choose one' });

  const vaccinated = getRadioValue('vaccinated');
  const vaccOk = !!vaccinated;
  if (!vaccOk) setError('vaccinated', 'Please choose a vaccination status.');
  data.push({ label: 'Vaccinated?', value: vaccinated || '', ok: vaccOk, msg: vaccOk ? 'pass' : 'ERROR: Please choose one' });

  const visitType = getRadioValue('visitType');
  const visitOk = !!visitType;
  if (!visitOk) setError('visitType', 'Please choose a visit type.');
  data.push({ label: 'Visit type', value: visitType || '', ok: visitOk, msg: visitOk ? 'pass' : 'ERROR: Please choose one' });

  data.push({
    label: 'Income (sliding scale)',
    value: '$' + Number(document.getElementById('incomeSlider').value).toLocaleString('en-US'),
    ok: true,
    msg: 'pass'
  });

  // --- Symptoms ---
  const symptoms = validateSymptoms();
  data.push({
    label: 'Described symptoms',
    value: symptoms.value || '(none entered)',
    ok: symptoms.ok,
    msg: symptoms.ok ? 'pass' : 'ERROR: Remove double-quote characters'
  });

  // --- User ID ---
  const userId = validateUserId();
  data.push({ label: 'User ID', value: userId.value.toLowerCase(), ok: userId.ok, msg: userId.ok ? 'pass' : 'ERROR: Check User ID format' });

  // --- Passwords ---
  const pwResult = validatePassword();
  const matchResult = confirmPasswordMatch();
  const passwordOk = pwResult.ok && matchResult.ok;
  data.push({
    label: 'Password',
    value: pwResult.value ? pwResult.value + '  (normally we would not display this)' : '',
    ok: passwordOk,
    msg: passwordOk ? 'pass' : 'ERROR: Check password requirements / match'
  });

  const allOk = data.every(function (row) { return row.ok; });
  return { data: data, allOk: allOk };
}

/* ---------- module: render the review table into the page (div/span area) ---------- */
function renderReview(data) {
  const tbody = document.querySelector('#reviewTable tbody');
  tbody.innerHTML = '';
  data.forEach(function (row) {
    const tr = document.createElement('tr');

    const tdLabel = document.createElement('td');
    tdLabel.className = 'rowLabel';
    tdLabel.textContent = row.label;

    const tdValue = document.createElement('td');
    tdValue.textContent = row.value;

    const tdStatus = document.createElement('td');
    tdStatus.textContent = row.msg;
    tdStatus.className = row.ok ? 'review-pass' : 'review-fail';

    tr.appendChild(tdLabel);
    tr.appendChild(tdValue);
    tr.appendChild(tdStatus);
    tbody.appendChild(tr);
  });

  const reviewArea = document.getElementById('reviewArea');
  reviewArea.hidden = false;
  reviewArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- handlers wired to the buttons ---------- */
function handleReview() {
  const result = validateAll();
  renderReview(result.data);
}

function handleSubmit(e) {
  e.preventDefault();
  const result = validateAll();
  renderReview(result.data);

  if (!result.allOk) {
    alert('Please fix the items marked with ERROR before submitting.');
    return;
  }

  // apply the two "clean up on submit" rules from the spec:
  const userId = document.getElementById('userId');
  userId.value = userId.value.toLowerCase();

  const zip = document.getElementById('zip');
  zip.value = zip.value.split('-')[0];

  window.location.href = 'thankyou.html?name=' + encodeURIComponent(document.getElementById('firstName').value);
}

function handleStartOver() {
  clearAllErrors();
  document.getElementById('reviewArea').hidden = true;
  document.getElementById('pwdChecklist').classList.remove('show');
  // let the native form reset finish, then reset the slider's text display
  setTimeout(updateIncomeDisplay, 0);
}

function handleClearReview() {
  document.getElementById('reviewArea').hidden = true;
  document.querySelector('#reviewTable tbody').innerHTML = '';
}
