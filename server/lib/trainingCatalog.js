// Training course catalogue. Authored content (not DB-managed). Per-partner
// completion lives in the TrainingProgress table. Quiz answer keys stay
// server-side — clients get questions without the `answer` field and POST their
// selections for grading.

export const PASS_MARK = 70;

export const COURSE_CATALOG = [
  {
    id: 'onboarding-basics',
    title: 'Getting started on ServisAku',
    category: 'Company Policy',
    type: 'video',
    duration_min: 6,
    mandatory: true,
    summary: 'How jobs flow from request to payout, and what makes a 5-star partner.',
    content:
      'ServisAku connects you with nearby customers. Accept a job, travel, mark Arrived, ' +
      'start the service, capture before/after photos, then Complete. Payouts (you keep 80%) ' +
      'are released to your wallet and withdrawable to your bank.',
    quiz: [
      { q: 'What share of the job price do you keep?', options: ['50%', '80%', '100%'], answer: 1 },
      { q: 'When should you mark "Arrived"?', options: ['When you accept', 'When you reach the customer location', 'After the job'], answer: 1 },
    ],
  },
  {
    id: 'safety-sop',
    title: 'Safety & PPE guidelines',
    category: 'Safety',
    type: 'reading',
    duration_min: 8,
    mandatory: true,
    summary: 'Personal protective equipment and on-site safety, aligned with DOSH practice.',
    content:
      'Always wear appropriate PPE (gloves, goggles, covered shoes). Isolate power at the ' +
      'distribution board before electrical work. Keep walkways clear, ventilate when using ' +
      'chemicals, and never work on live circuits. Report unsafe conditions and stop work if in doubt.',
    quiz: [
      { q: 'Before electrical work you should…', options: ['Work faster', 'Isolate power at the DB', 'Skip gloves'], answer: 1 },
      { q: 'If a site feels unsafe you should…', options: ['Continue anyway', 'Stop and report', 'Ignore it'], answer: 1 },
    ],
  },
  {
    id: 'customer-service',
    title: 'Customer behaviour & etiquette',
    category: 'Customer',
    type: 'reading',
    duration_min: 5,
    mandatory: true,
    summary: 'Communication, punctuality and respect in the customer’s home.',
    content:
      'Greet politely, confirm the scope from the booking details (never re-ask what the customer ' +
      'already answered), protect floors and furniture, keep the customer updated, and clean up after. ' +
      'Be punctual — use Report Delay if you are running late.',
    quiz: [
      { q: 'The customer already answered the service questions. You should…', options: ['Ask them all again', 'Read them in the booking detail', 'Guess'], answer: 1 },
    ],
  },
  {
    id: 'service-sop',
    title: 'Service execution SOP',
    category: 'Service SOP',
    type: 'video',
    duration_min: 7,
    mandatory: false,
    summary: 'Quality checklist, before/after photos and adding approved extras.',
    content:
      'Follow the workflow: before photos → perform the service to the quality checklist → after photos. ' +
      'If you find extra work, propose it as an extra — the customer approves and the invoice updates ' +
      'automatically. Never negotiate price in cash.',
    quiz: [
      { q: 'Extra work found mid-job should be…', options: ['Charged in cash', 'Proposed as an extra for customer approval', 'Done for free'], answer: 1 },
    ],
  },
  {
    id: 'payments-payouts',
    title: 'Payments, wallet & payouts',
    category: 'Company Policy',
    type: 'reading',
    duration_min: 4,
    mandatory: false,
    summary: 'How earnings, the wallet and bank withdrawals work.',
    content:
      'Completed jobs add to your lifetime earnings. Your withdrawable balance can be sent to your ' +
      'Malaysian bank account from the Wallet. Cancellations and penalties may reduce earnings.',
    quiz: [],
  },
];

export function publicCourse(c, progress) {
  return {
    id: c.id,
    title: c.title,
    category: c.category,
    type: c.type,
    duration_min: c.duration_min,
    mandatory: c.mandatory,
    summary: c.summary,
    content: c.content,
    has_quiz: (c.quiz || []).length > 0,
    quiz: (c.quiz || []).map((q) => ({ q: q.q, options: q.options })), // answer key stripped
    status: progress?.status || 'not_started',
    score: progress?.score ?? null,
    completed_at: progress?.completedAt ?? null,
  };
}

// Returns { passed, score } for a course given the partner's selected answers.
export function gradeQuiz(course, answers = []) {
  const quiz = course.quiz || [];
  if (quiz.length === 0) return { passed: true, score: 100 };
  let correct = 0;
  quiz.forEach((q, i) => { if (answers[i] === q.answer) correct += 1; });
  const score = Math.round((correct / quiz.length) * 100);
  return { passed: score >= PASS_MARK, score };
}
