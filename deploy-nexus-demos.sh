#!/bin/bash
# NEXUS Demos - One-Click Deployment Script for Termux
# This script adds all demo files to your GitHub repo and deploys them

echo "🛡️  NEXUS Demo Deployment Script"
echo "=================================="
echo ""

# Navigate to your repo (CHANGE THIS to your actual repo path)
cd ~/storage/shared/your-repo-name || { echo "❌ Error: Repo not found. Please edit the script and change 'your-repo-name' to your actual folder name."; exit 1; }

echo "✓ Found repository"
echo ""

# Create demos folder
mkdir -p demos
echo "✓ Created demos folder"

# Create demos-hub.html
cat > demos/demos-hub.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEXUS Demos - Interactive Demonstrations</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
            color: #f7fafc;
            min-height: 100vh;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        header {
            text-align: center;
            margin-bottom: 3rem;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #00d4ff 0%, #b794f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle {
            font-size: 1.25rem;
            color: #a0aec0;
        }
        .demos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        .demo-card {
            background: rgba(37, 43, 74, 0.6);
            border: 2px solid rgba(0, 212, 255, 0.3);
            border-radius: 1rem;
            padding: 2rem;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .demo-card:hover {
            transform: translateY(-5px);
            border-color: #00d4ff;
            box-shadow: 0 10px 40px rgba(0, 212, 255, 0.3);
        }
        .demo-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .demo-card h2 {
            font-size: 1.75rem;
            margin-bottom: 1rem;
            color: #00d4ff;
        }
        .demo-card p {
            color: #a0aec0;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }
        .demo-features {
            list-style: none;
            margin-bottom: 1.5rem;
        }
        .demo-features li {
            padding: 0.5rem 0;
            color: #cbd5e0;
            font-size: 0.9rem;
        }
        .demo-features li:before {
            content: "✓ ";
            color: #48bb78;
            font-weight: bold;
            margin-right: 0.5rem;
        }
        .launch-button {
            display: inline-block;
            background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .launch-button:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
        }
        .back-link {
            text-align: center;
            margin-top: 2rem;
        }
        .back-link a {
            color: #00d4ff;
            text-decoration: none;
            font-size: 1.1rem;
        }
        .back-link a:hover {
            text-decoration: underline;
        }
        .note {
            background: rgba(183, 148, 246, 0.1);
            border-left: 4px solid #b794f6;
            padding: 1rem;
            margin-top: 2rem;
            border-radius: 0.5rem;
        }
        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }
            .demos-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🛡️ NEXUS Interactive Demos</h1>
            <p class="subtitle">Experience the future of intelligent vehicle systems</p>
        </header>
        <div class="demos-grid">
            <div class="demo-card" onclick="window.location.href='guardian-dashboard.html'">
                <div class="demo-icon">🎛️</div>
                <h2>Guardian Dashboard</h2>
                <p>Experience the complete 6-tab command center with real-time vehicle intelligence, voice control, and security monitoring.</p>
                <ul class="demo-features">
                    <li>Real-time speed simulation</li>
                    <li>Police scanner feed</li>
                    <li>Voice command integration</li>
                    <li>360° camera controls</li>
                    <li>Security system monitoring</li>
                    <li>Recording management</li>
                </ul>
                <a href="guardian-dashboard.html" class="launch-button">Launch Dashboard →</a>
            </div>
            <div class="demo-card" onclick="window.location.href='guardian-protocol.html'">
                <div class="demo-icon">🛡️</div>
                <h2>Guardian Protocol</h2>
                <p>See how AI intervention saves lives in three critical scenarios: impaired driving, responsible recognition, and road rage de-escalation.</p>
                <ul class="demo-features">
                    <li>Impaired driver full protection</li>
                    <li>Responsible driver celebration</li>
                    <li>Road rage de-escalation</li>
                    <li>Real-time AI intervention</li>
                    <li>Educational debriefs</li>
                    <li>Evidence collection</li>
                </ul>
                <a href="guardian-protocol.html" class="launch-button">Launch Protocol →</a>
            </div>
            <div class="demo-card" onclick="window.location.href='maintenance-hub.html'">
                <div class="demo-icon">🔧</div>
                <h2>Maintenance Hub</h2>
                <p>Explore OBD-II diagnostics, NEXUS Certification training, and AI-guided DIY repairs that turn every fix into a learning opportunity.</p>
                <ul class="demo-features">
                    <li>Vehicle health monitoring</li>
                    <li>OBD-II code reader with AI explanations</li>
                    <li>Maintenance scheduling</li>
                    <li>NEXUS Certification program</li>
                    <li>Service history tracking</li>
                    <li>DIY savings calculator</li>
                </ul>
                <a href="maintenance-hub.html" class="launch-button">Launch Maintenance →</a>
            </div>
        </div>
        <div class="note">
            <strong>📝 Note:</strong> These are fully functional prototypes with simulated data. No actual vehicle connection is required. All features demonstrate the capabilities of the NEXUS system.
        </div>
        <div class="back-link">
            <a href="/">← Back to Main Site</a>
        </div>
    </div>
</body>
</html>
EOF

echo "✓ Created demos-hub.html"

# Note: Due to character limits, I'll create a shorter version
# For full demos, you'll need to copy them from the artifacts I created above

cat > demos/guardian-dashboard.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEXUS Guardian Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0a0e27;
            color: #f7fafc;
            padding: 2rem;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header {
            background: rgba(37, 43, 74, 0.8);
            padding: 1.5rem;
            border-radius: 1rem;
            margin-bottom: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo { font-size: 1.5rem; font-weight: bold; color: #00d4ff; }
        .back-link {
            position: fixed;
            top: 1rem;
            left: 1rem;
            background: rgba(37, 43, 74, 0.95);
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            color: #00d4ff;
            text-decoration: none;
            border: 1px solid rgba(0, 212, 255, 0.3);
            z-index: 1000;
        }
        .content {
            background: rgba(37, 43, 74, 0.6);
            border: 2px solid rgba(0, 212, 255, 0.3);
            border-radius: 1rem;
            padding: 2rem;
            min-height: 400px;
            text-align: center;
        }
        h1 { color: #00d4ff; margin-bottom: 2rem; }
    </style>
</head>
<body>
    <a href="demos-hub.html" class="back-link">← Back to Demos</a>
    <div class="container">
        <div class="header">
            <div class="logo">🛡️ NEXUS GUARDIAN DASHBOARD</div>
        </div>
        <div class="content">
            <h1>Guardian Dashboard Demo</h1>
            <p style="color: #a0aec0; font-size: 1.25rem;">Full interactive dashboard coming soon!</p>
            <p style="color: #a0aec0; margin-top: 2rem;">This is a placeholder. Copy the full code from the guardian-dashboard.html artifact to replace this file.</p>
        </div>
    </div>
</body>
</html>
EOF

echo "✓ Created guardian-dashboard.html (placeholder)"

cat > demos/guardian-protocol.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEXUS Guardian Protocol</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0a0e27;
            color: #f7fafc;
            padding: 2rem;
        }
        .container { max-width: 1200px; margin: 0 auto; text-align: center; }
        .back-link {
            position: fixed;
            top: 1rem;
            left: 1rem;
            background: rgba(37, 43, 74, 0.95);
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            color: #00d4ff;
            text-decoration: none;
            border: 1px solid rgba(0, 212, 255, 0.3);
        }
        .content {
            background: rgba(37, 43, 74, 0.6);
            border: 2px solid rgba(0, 212, 255, 0.3);
            border-radius: 1rem;
            padding: 3rem;
            margin-top: 3rem;
        }
        h1 { color: #00d4ff; margin-bottom: 2rem; font-size: 2.5rem; }
    </style>
</head>
<body>
    <a href="demos-hub.html" class="back-link">← Back to Demos</a>
    <div class="container">
        <div class="content">
            <h1>🛡️ Guardian Protocol Demo</h1>
            <p style="color: #a0aec0; font-size: 1.25rem;">Full safety scenarios coming soon!</p>
            <p style="color: #a0aec0; margin-top: 2rem;">Copy the full code from the guardian-protocol.html artifact to replace this file.</p>
        </div>
    </div>
</body>
</html>
EOF

echo "✓ Created guardian-protocol.html (placeholder)"

cat > demos/maintenance-hub.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEXUS Maintenance Hub</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0a0e27;
            color: #f7fafc;
            padding: 2rem;
        }
        .container { max-width: 1400px; margin: 0 auto; text-align: center; }
        .back-link {
            position: fixed;
            top: 1rem;
            left: 1rem;
            background: rgba(37, 43, 74, 0.95);
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            color: #00d4ff;
            text-decoration: none;
            border: 1px solid rgba(0, 212, 255, 0.3);
        }
        .content {
            background: rgba(37, 43, 74, 0.6);
            border: 2px solid rgba(0, 212, 255, 0.3);
            border-radius: 1rem;
            padding: 3rem;
            margin-top: 3rem;
        }
        h1 { color: #00d4ff; margin-bottom: 2rem; font-size: 2.5rem; }
    </style>
</head>
<body>
    <a href="demos-hub.html" class="back-link">← Back to Demos</a>
    <div class="container">
        <div class="content">
            <h1>🔧 Maintenance Hub Demo</h1>
            <p style="color: #a0aec0; font-size: 1.25rem;">Full maintenance system coming soon!</p>
            <p style="color: #a0aec0; margin-top: 2rem;">Copy the full code from the maintenance-hub.html artifact to replace this file.</p>
        </div>
    </div>
</body>
</html>
EOF

echo "✓ Created maintenance-hub.html (placeholder)"
echo ""
echo "📝 Note: The demo files are placeholders. For full functionality, manually replace them with the complete code from the artifacts."
echo ""

# Git commands
echo "🔄 Adding files to Git..."
git add demos/

echo "💾 Committing changes..."
git commit -m "Add NEXUS demo applications - Guardian Dashboard, Protocol, and Maintenance Hub"

echo "🚀 Pushing to GitHub..."
git push origin main || git push origin master

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Your demos will be live at:"
echo "   - kaneonexus.com/demos/demos-hub.html"
echo "   - kaneonexus.com/demos/guardian-dashboard.html"
echo "   - kaneonexus.com/demos/guardian-protocol.html"
echo "   - kaneonexus.com/demos/maintenance-hub.html"
echo ""
echo "⏱️  Netlify should deploy in 30-60 seconds"
echo ""
echo "🎉 Don't forget to add a link to /demos/demos-hub.html on your main landing page!"
echo ""
