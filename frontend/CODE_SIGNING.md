# Windows Code Signing & Smart App Control Guide for IDRMusic

This document explains the security architecture behind Windows 11 Smart App Control (SAC), Microsoft Defender SmartScreen, and how to configure a valid code-signing certificate for IDRMusic.

---

## 1. What Caused the Smart App Control Warning?

When launching `IDRMusic-Setup-1.0.0.exe`, Windows 11 displayed:
> *"Smart App Control blocked an app that may be unsafe. We blocked IDRMusic-Setup-1.0.0.exe because we could not verify its publisher to confirm it was safe to run."*

### Why this happens:
1. **Unsigned Binary:**
   When inspected using PowerShell (`Get-AuthenticodeSignature`), the current output files (`IDRMusic-Setup-1.0.0.exe` and `win-unpacked\IDRMusic.exe`) have:
   ```powershell
   Status        : NotSigned
   SignatureType : None
   ```
   Because no digital certificate was supplied during packaging, `electron-builder` skipped the signing step.
2. **Windows 11 Smart App Control (SAC) Enforcement:**
   Smart App Control uses Microsoft Defender cloud intelligence to evaluate binaries. An app will be blocked by SAC if:
   - It is **unsigned** or has an untrusted/self-signed certificate.
   - It does not have established **positive reputation** in the Microsoft Intelligent Security Graph.
3. **Publisher Verification Requirement:**
   SAC explicitly states: *"we could not verify its publisher"*. For Windows to verify a publisher, the binary must be signed with an Authenticode certificate issued by a trusted Certificate Authority (CA) recognized by the Microsoft Trusted Root Certificate Program.

---

## 2. What Code Signing Does (and What It Does Not Do)

* **What a Trusted Certificate Does:**
  - Verifies the integrity of the binary (guarantees the `.exe` has not been tampered with or corrupted).
  - Displays your verified publisher name (e.g. `Indrajit Padhiyar`) instead of "Unknown Publisher" in Windows UAC and SmartScreen dialogs.
  - Allows Microsoft Defender and Smart App Control to associate telemetry and build trust across new versions.
* **What a Self-Signed Certificate Does NOT Do:**
  - Self-signed certificates (e.g. created with `New-SelfSignedCertificate`) are **rejected** by Smart App Control and SmartScreen on external computers because the root CA is not in the Microsoft Root Certificate store.
* **Important: Code Signing Alone Does Not Guarantee Instant SmartScreen / SAC Clearance:**
  - Even a signed binary must build **reputation** over time (number of installs, absence of malware reports).
  - An **EV (Extended Validation)** certificate or **Azure Trusted Signing** helps establish reputation significantly faster than Standard OV certificates.

---

## 3. How to Obtain a Trusted Windows Code-Signing Certificate

There are two primary industry-standard options for Windows desktop apps:

### Option A: Microsoft Azure Trusted Signing (Recommended & Modern)
Microsoft's cloud-based code signing service:
- Fully compliant with Microsoft SmartScreen and Smart App Control.
- Keys are managed securely in Microsoft HSMs (no physical USB tokens or exported PFX keys required).
- Cost-effective for individuals and organizations.
- Supported in CI/CD (GitHub Actions, Azure DevOps).

### Option B: Commercial CA Code Signing Certificate (EV or OV)
Issued by a public Certificate Authority:
- **Providers:** DigiCert, Sectigo, GlobalSign, Certum, SSL.com.
- Starting in June 2023, CA/B Forum guidelines require all code-signing private keys to be stored on FIPS 140-2 Level 2 compliant hardware (USB eToken, Cloud HSM, or Key Vault).
- An **EV (Extended Validation)** certificate requires organization identity verification and provides the highest baseline reputation.

---

## 4. How to Configure electron-builder to Sign IDRMusic

`electron-builder` has native code-signing support built-in. You never need to hardcode passwords or certificates into `package.json` or source code.

### Using a PFX Certificate via Environment Variables
If you have an exported `.pfx` or `.p12` file:

```powershell
# Set environment variables for the current session (do NOT commit to git)
$env:CSC_LINK = "C:\secure\certificates\idrmusic-cert.pfx"
$env:CSC_KEY_PASSWORD = "YourSecurePasswordHere"

# Run the installer build
npm run electron:build
```

### Using a Hardware Token or Windows Certificate Store
If your certificate is installed on a USB Token (YubiKey/SafeNet) or in the Windows Certificate Store:

In `package.json`, specify the certificate subject name under `win`:
```json
"win": {
  "certificateSubjectName": "Indrajit Padhiyar",
  "rfc3161TimeStampServer": "http://timestamp.digicert.com",
  "signingHashAlgorithms": ["sha256"]
}
```

---

## 5. How to Submit Unsigned / New Apps to Microsoft for Reputation

Before or after signing, you can submit your installer to Microsoft Security Intelligence to establish known good reputation:

1. Visit [Microsoft Defender Security Intelligence - Submit a file](https://www.microsoft.com/en-us/wdsi/filesubmission).
2. Select **Software Developer**.
3. Upload `IDRMusic-Setup-1.0.0.exe`.
4. Enter your app details and select "Incorrectly detected as malware / false positive / Smart App Control".
5. Microsoft's automated analysis pipeline scans the binary, checks for clean telemetry, and updates cloud reputation in Defender and SmartScreen.

---

## 6. How to Verify Digital Signatures in PowerShell

To inspect whether an installer or executable is digitally signed:

```powershell
Get-AuthenticodeSignature "D:\MiniProjects\musicdownload\frontend\release\IDRMusic-Setup-1.0.0.exe"
```

**Interpretation of Output:**
- `Status: Valid` + `SignerCertificate: [Your CA]` -> Correctly signed with a valid certificate.
- `Status: NotSigned` -> Binary has no digital signature (triggers Smart App Control block).
- `Status: UnknownError` / `UntrustedRoot` -> Binary is signed with an untrusted or self-signed certificate.

