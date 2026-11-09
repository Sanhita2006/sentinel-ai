import re
import sys

# Read the content
with open('src/pages/ScamMessageAnalysisPage.tsx', 'r') as f:
    content = f.read()

print("Before replacement:", repr(content[content.find('hasUrgency'):content.find('hasUrgency')+30]))

# Replace all old variable references
replacements = [
    ('hasUrgency', 'analysisResult && analysisResult.urgencyLevel === "high"'),
    ('hasFinancialCoercion', 'analysisResult && analysisResult.manipulationTactics.some(t => t.includes("financial"))'),
    ('hasSpfFail', 'analysisResult && analysisResult.headerAuthStatus === "fail"'),
    ('hasSuspiciousLink', 'analysisResult && analysisResult.extractedLinks.length > 0')
]

replaced = False
for old, new in replacements:
    content = content.replace(old, new)
    replaced = True
    print(f"Replaced {old} with {new}")

if not replaced:
    print("No replacements made!")
    sys.exit(1)

# Write the result
with open('src/pages/ScamMessageAnalysisPage.tsx', 'w') as f:
    f.write(content)

print("\nFile written successfully!")
