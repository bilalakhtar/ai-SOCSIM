import { GameState, Scenario, Feedback, FinalReport } from "../types";

// Predefined scenarios for the game rounds
const SCENARIOS_POOL: Scenario[] = [
  // ROUND 1: INITIAL RECON AND LOGIN ANOMALIES
  {
    id: "scen-1-a",
    title: "Suspicious Login Alert: Unauthorized Entry",
    description: "Multiple failed login attempts detected on the CEO's workstation from an unknown IP address in another country. The accounts are currently locked due to too many retries.",
    options: [
      { id: "opt-1-a-1", label: "Reset Password & Notify", explanation: "Force a password reset and alert the user." },
      { id: "opt-1-a-2", label: "Check IP Reputation", explanation: "Investigate if the source IP is known for malicious activity." },
      { id: "opt-1-a-3", label: "Ignore - Account Locked", explanation: "Wait for the user to report it since the account is safe." },
      { id: "opt-1-a-4", label: "Block IP at Firewall", explanation: "Immediately cut off all traffic from the offending source." }
    ]
  },
  {
    id: "scen-1-b",
    title: "Web Security: SQL Injection Attempt",
    description: "Your Web Application Firewall (WAF) flagged a series of requests to the login page containing 'OR 1=1' strings. The requests are coming from a residential VPN.",
    options: [
      { id: "opt-1-b-1", label: "Enable CAPTCHA", explanation: "Slow down automated attempts and verify humans." },
      { id: "opt-1-b-2", label: "Patch Code Vulnerability", explanation: "Immediately review and fix the login query parameters." },
      { id: "opt-1-b-3", label: "Blacklist VPN Range", explanation: "Block entire IP ranges associated with the VPN provider." },
      { id: "opt-1-b-4", label: "Monitor db logs", explanation: "Watch for successful query executions without blocking yet." }
    ]
  },
  // ROUND 2: SOCIAL ENGINEERING AND WEB THREATS
  {
    id: "scen-2-a",
    title: "Phishing Signal: Urgent Payroll Email",
    description: "Several employees report receiving an email from 'HR-Support' asking them to verify their direct deposit details via an external link. One employee admits to clicking the link.",
    options: [
      { id: "opt-2-a-1", label: "Isolate Clicker's Machine", explanation: "Quarantine the host to prevent potential malware spread." },
      { id: "opt-2-a-2", label: "Scan Web Logs", explanation: "Check if other users visited the phishing domain." },
      { id: "opt-2-a-3", label: "Send All-Hands Warning", explanation: "Inform the staff about the ongoing phishing attempt." },
      { id: "opt-2-a-4", label: "Analyze Link in Sandbox", explanation: "Determine the payload or site behavior safely." }
    ]
  },
  {
    id: "scen-2-b",
    title: "Physical Threat: Tailgating Report",
    description: "A security guard reports an unidentified person followed an employee into the secure data center room without swiping their badge.",
    options: [
      { id: "opt-2-b-1", label: "Lock Down Room", explanation: "Electronically lock all exits to the data center immediately." },
      { id: "opt-2-b-2", label: "Review CC-TV", explanation: "Identify the person and the employee they followed." },
      { id: "opt-2-b-3", label: "Dispatch Guard", explanation: "Physically confront the individual in the secure area." },
      { id: "opt-2-b-4", label: "Audit Badge Logs", explanation: "Check which employee allowed the person in." }
    ]
  },
  // ROUND 3: MALWARE AND INSIDER THREATS
  {
    id: "scen-3-a",
    title: "Malware Alert: Suspicious Process",
    description: "An endpoint on the Marketing server is running 'svchost.exe' from the Downloads folder. It is communicating with a known C2 server over port 443.",
    options: [
      { id: "opt-3-a-1", label: "Kill the Process", explanation: "Stop the malicious execution immediately." },
      { id: "opt-3-a-2", label: "Full Disk Snapshot", explanation: "Capture evidence before taking any action." },
      { id: "opt-3-a-3", label: "Isolate Server", explanation: "Disconnect the server from the network to stop the C2." },
      { id: "opt-3-a-4", label: "Run Full AV Scan", explanation: "Let the antivirus handle the detection and cleanup." }
    ]
  },
  {
    id: "scen-3-b",
    title: "Insider Threat: Abnormal Export",
    description: "A database administrator who resigned yesterday just downloaded the entire customer table to a personal USB drive, bypassing the data loss prevention (DLP) alert.",
    options: [
      { id: "opt-3-b-1", label: "Disable DB Account", explanation: "Instantly revoke all access for the administrator." },
      { id: "opt-3-b-2", label: "Confiscate Laptop", explanation: "Physically secure the device before the admin leaves the building." },
      { id: "opt-3-b-3", label: "Wipe USB Remotely", explanation: "Attempt to use MDM software to wipe the connected drive." },
      { id: "opt-3-b-4", label: "Inform Legal/HR", explanation: "Start official proceedings regarding the data theft." }
    ]
  },
  // ROUND 4: CLOUD AND SUPPLY CHAIN
  {
    id: "scen-4-a",
    title: "Data Exfiltration: High Traffic Vol",
    description: "A developer's laptop is pushing 50GB of data to an encrypted cloud storage bucket. This is unusual behavior for reaching the daily limit.",
    options: [
      { id: "opt-4-a-1", label: "Contact Developer", explanation: "Verify if this is a legitimate sync operation." },
      { id: "opt-4-a-2", label: "Suspend Account", explanation: "Disable the developer's credentials immediately." },
      { id: "opt-4-a-3", label: "Throttle Bandwidth", explanation: "Slow down the upload while you investigate." },
      { id: "opt-4-a-4", label: "Revoke API Keys", explanation: "Cut off access to the cloud storage service." }
    ]
  },
  {
    id: "scen-4-b",
    title: "Supply Chain: Malicious Library",
    description: "A vulnerability scanner found 'event-stream' dependency in your core app has been replaced with a version containing a crypto-stealer back-door.",
    options: [
      { id: "opt-4-b-1", label: "Rollback Version", explanation: "Revert to a known safe version of the library immediately." },
      { id: "opt-4-b-2", label: "Pause Deployments", explanation: "Stop all CI/CD pipelines to prevent further spread." },
      { id: "opt-4-b-3", label: "Rotate Private Keys", explanation: "Assume keys in memory were compromised and change them." },
      { id: "opt-4-b-4", label: "Audit Git Commits", explanation: "See who committed the update and when it happened." }
    ]
  },
  // ROUND 5: CRITICAL IMPACT AND RECOVERY
  {
    id: "scen-5-a",
    title: "Ransomware Threat: Encrypted Shares",
    description: "Users report they cannot open PDF files on the Finance drive. Files have a '.locked' extension and a ransom note has appeared.",
    options: [
      { id: "opt-5-a-1", label: "Shut Down All Servers", explanation: "Halt the spread of the encryption engine." },
      { id: "opt-5-a-2", label: "Disconnect Finance Drive", explanation: "Isolate the affected network share." },
      { id: "opt-5-a-3", label: "Locate Patient Zero", explanation: "Search for the workstation that initiated the encryption." },
      { id: "opt-5-a-4", label: "Restore From Backup", explanation: "Begin recovery procedures immediately." }
    ]
  },
  {
    id: "scen-5-b",
    title: "Cloud Exposure: Public S3 Bucket",
    description: "An automated bot in the cloud console flagged that your 'customer-attachments' bucket has been set to Public Read access by a junior dev.",
    options: [
      { id: "opt-5-b-1", label: "Make Private Instantly", explanation: "Force the bucket back to private access via CLI." },
      { id: "opt-5-b-2", label: "Check Access Logs", explanation: "See if anyone outside the company accessed files during the leak." },
      { id: "opt-5-b-3", label: "Disable Junior Dev", explanation: "Revoke the dev's cloud permissions to prevent further errors." },
      { id: "opt-5-b-4", label: "Enable Bucket Versioning", explanation: "Ensure you can recover from any malicious changes made." }
    ]
  }
];

const FEEDBACK_DB: Record<string, Feedback> = {
  // Round 1a
  "opt-1-a-1": { consequence: "Password Reset Triggered", scoreDelta: 10, riskDelta: -5, confidenceDelta: 5, explanation: "Standard procedure. Secured the account but didn't address the source." },
  "opt-1-a-2": { consequence: "IP Profiled", scoreDelta: 15, riskDelta: -2, confidenceDelta: 8, explanation: "Good intelligence gathering. Found the IP belongs to a known botnet." },
  "opt-1-a-4": { consequence: "Source Blocked", scoreDelta: 20, riskDelta: -10, confidenceDelta: 5, explanation: "Aggressive but effective. Prevented further brute force attempts." },
  "opt-1-a-3": { consequence: "Breach Escalated", scoreDelta: -10, riskDelta: 15, confidenceDelta: -5, explanation: "Negligence. The attacker switched to another account while you waited." },
  
  // Round 1b
  "opt-1-b-2": { consequence: "Vulnerability Patched", scoreDelta: 20, riskDelta: -15, confidenceDelta: 10, explanation: "Excellent! Fixing the root cause is better than blocking IPs." },
  "opt-1-b-1": { consequence: "Bot Attack Slowed", scoreDelta: 10, riskDelta: -5, confidenceDelta: 5, explanation: "Effective temporary mitigation against automated scripts." },
  "opt-1-b-3": { consequence: "Service Disruption", scoreDelta: 5, riskDelta: -5, confidenceDelta: -5, explanation: "Blocked legitimate users from that VPN region inadvertently." },
  "opt-1-b-4": { consequence: "Wait & See Failure", scoreDelta: -15, riskDelta: 20, confidenceDelta: -10, explanation: "The attacker bypassed the login and started dumping data." },

  // Round 2a
  "opt-2-a-4": { consequence: "Payload Analyzed", scoreDelta: 20, riskDelta: -5, confidenceDelta: 10, explanation: "Excellent forensic work. Found the link was a credential harvester." },
  "opt-2-a-2": { consequence: "Scope Identified", scoreDelta: 15, riskDelta: -8, confidenceDelta: 5, explanation: "Good visibility. Identified 3 other compromised sessions." },
  "opt-2-a-1": { consequence: "False Positive Impact", scoreDelta: 5, riskDelta: -2, confidenceDelta: -5, explanation: "A bit hasty, but cautious. The employee lost half a day of work." },
  "opt-2-a-3": { consequence: "Alert Fatigue", scoreDelta: -5, riskDelta: 0, confidenceDelta: 2, explanation: "Minimal impact. Users tend to ignore these warnings over time." },

  // Round 2b
  "opt-2-b-3": { consequence: "Intruder Apprehended", scoreDelta: 25, riskDelta: -20, confidenceDelta: 15, explanation: "Perfect response. Direct physical intervention secured the facility." },
  "opt-2-b-1": { consequence: "Ops Disrupted", scoreDelta: 10, riskDelta: -10, confidenceDelta: -5, explanation: "Secured the room, but trapped legitimate staff inside." },
  "opt-2-b-2": { consequence: "Delayed Response", scoreDelta: 5, riskDelta: 10, confidenceDelta: 5, explanation: "Good records, but the intruder exited before help arrived." },
  "opt-2-b-4": { consequence: "Internal Audit", scoreDelta: 10, riskDelta: -5, confidenceDelta: 0, explanation: "Identified the weak link, but the damage was already done." },

  // Round 3a
  "opt-3-a-3": { consequence: "Spread Contained", scoreDelta: 25, riskDelta: -15, confidenceDelta: 10, explanation: "Perfect response. Network isolation stopped the beaconing immediately." },
  "opt-3-a-1": { consequence: "Incomplete Cleanup", scoreDelta: 10, riskDelta: 5, confidenceDelta: 0, explanation: "The process was killed, but a persistence mechanism restarted it." },
  "opt-3-a-2": { consequence: "Evidence Preserved", scoreDelta: 15, riskDelta: 5, confidenceDelta: 5, explanation: "Great for forensics, but the malware continued to run during capture." },
  "opt-3-a-4": { consequence: "Signature Failure", scoreDelta: -10, riskDelta: 10, confidenceDelta: -10, explanation: "The malware was zero-day. AV failed to detect it. System compromised." },

  // Round 3b
  "opt-3-b-2": { consequence: "Hardware Recovered", scoreDelta: 25, riskDelta: -20, confidenceDelta: 10, explanation: "Swift action prevented the data from leaving the physical site." },
  "opt-3-b-1": { consequence: "Access Revoked", scoreDelta: 15, riskDelta: -5, confidenceDelta: 5, explanation: "Standard reactive measure. Slowed them down but drive was already packed." },
  "opt-3-b-4": { consequence: "Paperwork Loop", scoreDelta: -5, riskDelta: 15, confidenceDelta: 0, explanation: "Bureaucracy isn't an incident response move. The admin is long gone." },
  "opt-3-b-3": { consequence: "Wipe Unsuccessful", scoreDelta: 10, riskDelta: 5, confidenceDelta: -5, explanation: "Drive wasn't connected to the network; remote wipe failed." },

  // Round 4a
  "opt-4-a-2": { consequence: "Leak Halted", scoreDelta: 20, riskDelta: -10, confidenceDelta: 5, explanation: "Fast action. Prevented the last 20GB from being stolen." },
  "opt-4-a-1": { consequence: "Social Engineering Risk", scoreDelta: 5, riskDelta: 5, confidenceDelta: 5, explanation: "The developer's account was hijacked. They 'confirmed' it was them." },
  "opt-4-a-3": { consequence: "Partial Loss", scoreDelta: 10, riskDelta: -5, confidenceDelta: 0, explanation: "Bought time, but files are still leaving the network slowly." },
  "opt-4-a-4": { consequence: "Access Revoked", scoreDelta: 15, riskDelta: -8, confidenceDelta: 5, explanation: "Solid mitigation strategy without locking the whole account." },

  // Round 4b
  "opt-4-b-1": { consequence: "Supply Chain Secured", scoreDelta: 25, riskDelta: -15, confidenceDelta: 15, explanation: "Perfect. Rolling back to a trusted version is the primary fix." },
  "opt-4-b-3": { consequence: "Keys Sanitized", scoreDelta: 20, riskDelta: -10, confidenceDelta: 5, explanation: "Critical move. Even if they had the keys, they're useless now." },
  "opt-4-b-2": { consequence: "Dev Friction", scoreDelta: 10, riskDelta: -5, confidenceDelta: -10, explanation: "Stopped the bleeding but caused major engineering delays." },
  "opt-4-b-4": { consequence: "Forensic Trail", scoreDelta: 10, riskDelta: 5, confidenceDelta: 5, explanation: "Good to know how it got in, but the code is still vulnerable." },

  // Round 5a
  "opt-5-a-3": { consequence: "Heroic efficiency", scoreDelta: 25, riskDelta: -5, confidenceDelta: 15, explanation: "Found the infected laptop and cut its wifi. Stopped the source." },
  "opt-5-a-2": { consequence: "Volume Isolated", scoreDelta: 15, riskDelta: -10, confidenceDelta: 5, explanation: "Good move. Stopped the encryption from spreading to other drives." },
  "opt-5-a-1": { consequence: "Nuclear Option", scoreDelta: 20, riskDelta: -20, confidenceDelta: -10, explanation: "Stopped the ransomware, but caused a company-wide outage." },
  "opt-5-a-4": { consequence: "Recovery Overload", scoreDelta: 5, riskDelta: 10, confidenceDelta: 0, explanation: "Too soon. The ransomware was still active and encrypted backups too." },

  // Round 5b
  "opt-5-b-1": { consequence: "Leak Plugged", scoreDelta: 25, riskDelta: -25, confidenceDelta: 15, explanation: "Immediate remediation via CLI is the correct way to handle cloud exposure." },
  "opt-5-b-2": { consequence: "Damage Assessment", scoreDelta: 15, riskDelta: -5, confidenceDelta: 5, explanation: "Important for legal reasons. Found 12 unknown IP downloads." },
  "opt-5-b-4": { consequence: "Future Safe", scoreDelta: 10, riskDelta: 0, confidenceDelta: 5, explanation: "Good long-term thinking, but doesn't solve the current leak." },
  "opt-5-b-3": { consequence: "Human Focus Error", scoreDelta: -5, riskDelta: 20, confidenceDelta: -5, explanation: "Punishing the dev doesn't secure the data. The bucket is still public." }
};

export async function generateScenario(state: GameState): Promise<Scenario> {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 600));
  
  // Filter scenarios for the current round type (a or b)
  const roundPrefix = `scen-${state.round}`;
  const possibleScenarios = SCENARIOS_POOL.filter(s => s.id.startsWith(roundPrefix));
  
  // Pick a random one from the possible matches for this round
  if (possibleScenarios.length > 0) {
    const randomIndex = Math.floor(Math.random() * possibleScenarios.length);
    return possibleScenarios[randomIndex];
  }
  
  return SCENARIOS_POOL[0]; // Fallback
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
  let rating = "Junior Analyst";
  if (score > 100) rating = "Elite SOC Lead";
  else if (score > 70) rating = "Senior Responder";
  else if (score < 40) rating = "Security Risk";

  return {
    rating,
    goodDecisions: [
      "Demonstrated ability to differentiate between tactical fixes and root causes.",
      "Maintained network availability while suppressing high-priority threats."
    ],
    riskyChoices: [
      "Showed occasional vulnerability to social engineering or bureaucratic delays.",
      "Some responses prioritized forensics over immediate containment."
    ],
    recommendations: [
      "Strengthen Zero Trust architecture for all administrative accounts.",
      "Integrate automated threat hunting for cloud storage misconfigurations.",
      "Implement stricter supply chain security audits for core applications."
    ]
  };
}
