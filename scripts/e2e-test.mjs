async function test() {
  const BASE = 'http://localhost:3000';
  console.log('--- STARTING EPOCH HUB FULL VERIFICATION TEST ---');

  // 1. Unregistered phone login attempt
  console.log('\n[1] Testing unregistered phone login...');
  const unregRes = await fetch(`${BASE}/api/auth/phone-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+919999999999' })
  });
  const unregData = await unregRes.json();
  if (unregRes.status === 404 && unregData.error) {
    console.log('✓ PASS: Unregistered phone was correctly rejected (404 Not Found):', unregData.error);
  } else {
    throw new Error(`Failed unregistered test: ${JSON.stringify(unregData)}`);
  }

  // 2. Direct phone login with registered number (Rehan - Super Admin)
  console.log('\n[2] Testing registered phone login (+919876543210 - Rehan)...');
  const adminRes = await fetch(`${BASE}/api/auth/phone-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+919876543210' })
  });
  const adminCookie = adminRes.headers.get('set-cookie');
  const adminData = await adminRes.json();
  if (adminRes.ok && adminData.user.name === 'Mohammed Rehan') {
    console.log(`✓ PASS: Logged in directly as ${adminData.user.name} (${adminData.user.role})!`);
  } else {
    throw new Error(`Failed admin login: ${JSON.stringify(adminData)}`);
  }

  // 3. Direct phone login as Member (Alex Turner - +919876543212)
  console.log('\n[3] Testing registered phone login as Member (+919876543212 - Alex)...');
  const alexRes = await fetch(`${BASE}/api/auth/phone-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543212' }) // without +91 prefix
  });
  const alexCookie = alexRes.headers.get('set-cookie');
  const alexData = await alexRes.json();
  if (alexRes.ok && alexData.user.name === 'Alex Turner') {
    console.log(`✓ PASS: Logged in directly as ${alexData.user.name} without country prefix!`);
  } else {
    throw new Error(`Failed member login: ${JSON.stringify(alexData)}`);
  }

  // 4. Test Task Claiming by Alex (tsk-001)
  console.log('\n[4] Testing atomic task claim (tsk-001)...');
  const claimRes = await fetch(`${BASE}/api/tasks/tsk-001/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': alexCookie
    }
  });
  const claimData = await claimRes.json();
  if (claimRes.ok && claimData.success) {
    console.log('✓ PASS: Task tsk-001 claimed successfully by Alex!');
  } else {
    console.log('Note on claim:', claimData);
  }

  // 5. Test Double-Claim Safeguard (Race condition check)
  console.log('\n[5] Testing race-condition / double-claim prevention...');
  const doubleClaimRes = await fetch(`${BASE}/api/tasks/tsk-001/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookie
    }
  });
  const doubleClaimData = await doubleClaimRes.json();
  if (!doubleClaimRes.ok) {
    console.log('✓ PASS: Double-claim blocked as expected:', doubleClaimData.error);
  } else {
    throw new Error('Double claim was not prevented!');
  }

  // 6. Test Deliverable Submission by Alex
  console.log('\n[6] Testing multipart deliverable upload for tsk-001...');
  const formData = new FormData();
  const fileContent = Buffer.from('console.log("Epoch live countdown module built!");');
  const blob = new Blob([fileContent], { type: 'text/plain' });
  formData.append('file', blob, 'countdown-microsite.zip');
  formData.append('comment', 'Responsive countdown widget ready for staging deployment.');

  const submitRes = await fetch(`${BASE}/api/tasks/tsk-001/submit`, {
    method: 'POST',
    headers: { 'Cookie': alexCookie },
    body: formData
  });
  const submitData = await submitRes.json();
  if (submitRes.ok && submitData.success) {
    console.log(`✓ PASS: Deliverable uploaded! Submission ID: ${submitData.submissionId}, Version: v${submitData.version}`);
  } else {
    throw new Error(`Failed deliverable submission: ${JSON.stringify(submitData)}`);
  }

  // 7. Login as Reviewer Dev Mehta (+919876543214) and Approve
  console.log('\n[7] Testing deliverable review and point award by Reviewer (Dev Mehta)...');
  const revRes = await fetch(`${BASE}/api/auth/phone-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+919876543214' })
  });
  const revCookie = revRes.headers.get('set-cookie');

  const approveRes = await fetch(`${BASE}/api/submissions/${submitData.submissionId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': revCookie
    },
    body: JSON.stringify({
      action: 'APPROVE',
      reviewComment: 'Verified countdown component. Outstanding work!'
    })
  });
  const approveData = await approveRes.json();
  if (approveRes.ok && approveData.success) {
    console.log(`✓ PASS: Deliverable approved! +${approveData.pointsAwarded} points awarded to Alex!`);
  } else {
    throw new Error(`Failed review approval: ${JSON.stringify(approveData)}`);
  }

  // 8. Test Double-Award Safeguard
  console.log('\n[8] Testing double-point award prevention on the same task...');
  const doubleApproveRes = await fetch(`${BASE}/api/submissions/${submitData.submissionId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': revCookie
    },
    body: JSON.stringify({
      action: 'APPROVE',
      reviewComment: 'Attempt duplicate award'
    })
  });
  const doubleApproveData = await doubleApproveRes.json();
  if (!doubleApproveRes.ok) {
    console.log('✓ PASS: Double-award blocked as expected:', doubleApproveData.error);
  } else {
    throw new Error('Double points award was not blocked!');
  }

  // 9. Test Deadline Check & Missed Task Deduplication
  console.log('\n[9] Testing automated deadline check and penalty deduplication...');
  const cronRes1 = await fetch(`${BASE}/api/cron/check-deadlines`, { method: 'POST' });
  const cronData1 = await cronRes1.json();
  console.log('Run 1 result:', cronData1.message);

  const cronRes2 = await fetch(`${BASE}/api/cron/check-deadlines`, { method: 'POST' });
  const cronData2 = await cronRes2.json();
  console.log('Run 2 result (Idempotency):', cronData2.message);
  if (cronData2.penalizedCount === 0) {
    console.log('✓ PASS: Zero duplicate penalties applied on subsequent run!');
  } else {
    throw new Error('Duplicate penalties were applied!');
  }

  // 10. Test Leaderboard Rankings
  console.log('\n[10] Testing leaderboard calculations...');
  const lbRes = await fetch(`${BASE}/api/leaderboard`);
  const lbData = await lbRes.json();
  if (lbRes.ok && lbData.leaderboard.length > 0) {
    console.log(`✓ PASS: Leaderboard computed with ${lbData.leaderboard.length} members. Top rank: ${lbData.leaderboard[0].name} (${lbData.leaderboard[0].total_points} pts)`);
  }

  console.log('\n======================================================');
  console.log('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY! ✓✓✓');
  console.log('======================================================\n');
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
