import React from "react";
import {
  MapPin,
  Users,
  Clock,
  Globe,
  Shield,
  Zap,
  Award,
  Linkedin,
  ExternalLink,
  PlayCircle,
  Headphones,
  Sparkles,
  Github,
} from "lucide-react";
import styles from "./HeritageLandingPage.module.css";

const HeritageLandingPage = ({ onLaunchApp }) => {
  return (
    <div className={styles.heritageContainer}>
      <div className={styles.backgroundPattern}></div>
      <div className={styles.content}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <Award className={styles.badgeIcon} size={16} />
              <span>Powered by Google Cloud & Gemini AI</span>
            </div>

            <h1 className={styles.mainHeadline}>
              Resurrecting History
              <br />
              <span className={styles.accentText}>with AI.</span>
            </h1>

            <p className={styles.heroSubtitle}>
              MonuTell transforms silent statues into storytelling guides,
              <br />
              bringing cultural heritage to life through intelligent audio
              narration.
            </p>

            <div className={styles.ctaButtons}>
              <button className={styles.ctaButton} onClick={onLaunchApp}>
                <PlayCircle className={styles.ctaIcon} />
                Launch Live Beta App
              </button>
            </div>

            <div className={styles.trustBadges}>
              <div className={styles.trustItem}>
                <MapPin size={20} />
                <span>50+ Monuments</span>
              </div>
              <div className={styles.trustItem}>
                <Globe size={20} />
                <span>3 Languages</span>
              </div>
              <div className={styles.trustItem}>
                <Shield size={20} />
                <span>Google Cloud Secured</span>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.demoSection}>
          <div className={styles.demoContent}>
            <div className={styles.demoText}>
              <h2 className={styles.demoTitle}>See It In Action</h2>
              <p className={styles.demoDescription}>
                Experience immersive audio storytelling at every monument.
                Select a location, and our AI instantly generates a captivating
                narration in your preferred language.
              </p>
              <div className={styles.demoFeatures}>
                <div className={styles.demoFeature}>
                  <Zap size={20} className={styles.featureIcon} />
                  <span>Instant Generation</span>
                </div>
                <div className={styles.demoFeature}>
                  <Globe size={20} className={styles.featureIcon} />
                  <span>Multi-Language</span>
                </div>
                <div className={styles.demoFeature}>
                  <Headphones size={20} className={styles.featureIcon} />
                  <span>Neural Voice</span>
                </div>
              </div>
            </div>

            <div className={styles.phoneMockup}>
              <div className={styles.iphoneImageWrapper}>
                <img
                  src="/assets/monutell_iphone.jpeg"
                  alt="MonuTell App Interface"
                  className={styles.iphoneImage}
                />
                <div className={styles.nowPlayingFloatingBadge}>
                  <div className={styles.playingDotFloating}></div>
                  <span>Now Playing</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.problemSolutionSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Silent Monument Problem</h2>
            <p className={styles.sectionSubtitle}>
              Traditional tourism is broken. We're fixing it with AI.
            </p>
          </div>

          <div className={styles.problemSolutionGrid}>
            <div className={styles.problemCard}>
              <div className={styles.cardIcon}>
                <Clock className={styles.iconNegative} />
              </div>
              <h3>The Problem</h3>
              <ul className={styles.problemList}>
                <li>Monuments are silent and lack context</li>
                <li>Traditional audio guides are outdated and static</li>
                <li>Language barriers limit cultural understanding</li>
                <li>Generic tours miss unique stories</li>
              </ul>
            </div>

            <div className={styles.solutionCard}>
              <div className={styles.cardIcon}>
                <Zap className={styles.iconPositive} />
              </div>
              <h3>Our Solution</h3>
              <ul className={styles.solutionList}>
                <li>
                  <strong>Real-time AI generation</strong> using Gemini Pro
                </li>
                <li>
                  <strong>Culturally accurate</strong> narratives from vetted
                  data
                </li>
                <li>
                  <strong>Native language support</strong> (EN, HU, TR)
                </li>
                <li>
                  <strong>Personalized storytelling</strong> for every visitor
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.targetAudience}>
            <h4>Built for:</h4>
            <div className={styles.audienceTags}>
              <span className={styles.tag}>Curious Travelers</span>
              <span className={styles.tag}>History Buffs</span>
              <span className={styles.tag}>Digital Nomads</span>
              <span className={styles.tag}>Cultural Enthusiasts</span>
            </div>
          </div>
        </section>
        <section className={styles.techStackSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Powered by Google Cloud Infrastructure
            </h2>
            <p className={styles.sectionSubtitle}>
              Enterprise-grade AI technology delivering sub-2-second generation
              times
            </p>
          </div>

          <div className={styles.techGrid}>
            <div className={styles.techCard}>
              <div className={styles.techLogo}>
                <div className={styles.logoCircle}>GCP</div>
              </div>
              <h4>Google Cloud Platform</h4>
              <p>
                Global infrastructure with 99.9% uptime SLA, ensuring reliable
                access worldwide.
              </p>
              <div className={styles.techBadge}>Infrastructure</div>
            </div>

            <div className={styles.techCard}>
              <div className={styles.techLogo}>
                <div className={styles.logoCircle}>VAI</div>
              </div>
              <h4>Vertex AI</h4>
              <p>
                Advanced machine learning orchestration for intelligent content
                generation and personalization.
              </p>
              <div className={styles.techBadge}>ML Platform</div>
            </div>

            <div className={styles.techCard}>
              <div className={styles.techLogo}>
                <div className={styles.logoCircle}>✨</div>
              </div>
              <h4>Gemini Pro</h4>
              <p>
                Multimodal AI model generating historically accurate, engaging
                narratives in milliseconds.
              </p>
              <div className={styles.techBadge}>Gen AI</div>
            </div>

            <div className={styles.techCard}>
              <div className={styles.techLogo}>
                <div className={styles.logoCircle}>TTS</div>
              </div>
              <h4>Google Cloud TTS</h4>
              <p>
                Neural text-to-speech with WaveNet technology for natural,
                human-like audio.
              </p>
              <div className={styles.techBadge}>Voice AI</div>
            </div>
          </div>

          <div className={styles.techHighlight}>
            <Shield className={styles.highlightIcon} />
            <p>
              <strong>Why Google Cloud?</strong> Enterprise security, global
              scalability, and cutting-edge AI capabilities that enable us to
              deliver culturally sensitive content at scale.
            </p>
          </div>
        </section>
        <section className={styles.teamSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built by Builders</h2>
            <p className={styles.sectionSubtitle}>
              Combining historical expertise with modern AI engineering
            </p>
          </div>

          <div className={styles.founderCard}>
            <div className={styles.founderAvatar}>
              <div className={styles.avatarCircle}>DA</div>
            </div>

            <div className={styles.founderContent}>
              <h3 className={styles.founderName}>Davut Aydemir</h3>
              <p className={styles.founderRole}>Founder & Lead Developer</p>

              <p className={styles.founderBio}>
                Lead Developer combining historical research with cutting-edge
                AI. Leveraging Google Cloud to digitize Budapest's heritage and
                create accessible cultural experiences for the next generation
                of travelers.
              </p>

              <div className={styles.founderMeta}>
                <div className={styles.metaItem}>
                  <MapPin size={16} />
                  <span>Budapest, Hungary</span>
                </div>
                <div className={styles.metaItem}>
                  <Users size={16} />
                  <span>Solo Founder</span>
                </div>
              </div>

              <div className={styles.founderLinks}>
                <a
                  href="https://www.linkedin.com/in/davut-aydemir/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkedinButton}
                >
                  <Linkedin size={18} />
                  LinkedIn Profile
                  <ExternalLink size={14} />
                </a>
                <a
                  href="https://github.com/davutayd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.githubButtonFounder}
                >
                  <Github size={18} />
                  GitHub Profile
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.statusSection}>
          <div className={styles.statusCard}>
            <h3 className={styles.statusTitle}>🚀 Currently in Public Beta</h3>
            <p className={styles.statusDescription}>
              MonuTell is live and serving travelers in Budapest. We're actively
              gathering user feedback and expanding our monument database daily.
            </p>
            <div className={styles.statusMetrics}>
              <div className={styles.metric}>
                <div className={styles.metricValue}>Beta</div>
                <div className={styles.metricLabel}>Development Stage</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricValue}>Live</div>
                <div className={styles.metricLabel}>Product Status</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricValue}>Budapest</div>
                <div className={styles.metricLabel}>Current Coverage</div>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaHeadline}>
            Ready to Experience History Reimagined?
          </h2>
          <p className={styles.ctaSubtext}>
            Launch the live application and explore Budapest's monuments with
            AI-powered audio guides.
          </p>
          <button className={styles.ctaButtonLarge} onClick={onLaunchApp}>
            <PlayCircle className={styles.ctaIcon} />
            Launch Live Beta App
          </button>
        </section>
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <MapPin className={styles.footerIcon} />
              <span className={styles.footerBrandName}>MonuTell</span>
            </div>
            <div className={styles.footerText}>
              <p>
                © 2026 MonuTell. Powered by Google Cloud Platform, Vertex AI,
                and Gemini Pro.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HeritageLandingPage;
