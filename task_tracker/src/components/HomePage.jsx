import React from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const HomePage = () => {
  const { user } = React.useContext(AuthContext);

  // Styles object
  const styles = {
    homepage: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#333'
    },
    hero: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '4rem 0',
      gap: '2rem'
    },
    heroContent: {
      flex: 1
    },
    heroTitle: {
      fontSize: '3rem',
      marginBottom: '1rem',
      color: '#2c3e50',
      fontWeight: '700'
    },
    tagline: {
      fontSize: '1.5rem',
      color: '#7f8c8d',
      marginBottom: '2rem'
    },
    ctaButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center'
    },
    btn: {
      padding: '0.8rem 1.5rem',
      borderRadius: '5px',
      fontWeight: 'bold',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    btnPrimary: {
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none'
    },
    btnPrimaryHover: {
      backgroundColor: '#2980b9'
    },
    btnSecondary: {
      border: '2px solid #3498db',
      color: '#3498db',
      backgroundColor: 'transparent'
    },
    btnLarge: {
      padding: '1rem 2rem',
      fontSize: '1.2rem'
    },
    heroImage: {
      flex: 1,
      textAlign: 'center'
    },
    heroImg: {
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '400px'
    },
    features: {
      padding: '4rem 0',
      textAlign: 'center'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      marginBottom: '3rem',
      color: '#2c3e50'
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem'
    },
    featureCard: {
      padding: '2rem',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease',
      backgroundColor: 'white'
    },
    featureCardHover: {
      transform: 'translateY(-5px)'
    },
    featureIcon: {
      fontSize: '2.5rem',
      marginBottom: '1rem'
    },
    howItWorks: {
      padding: '4rem 0',
      textAlign: 'center'
    },
    steps: {
      textAlign: 'left',
      maxWidth: '600px',
      margin: '0 auto',
      fontSize: '1.2rem',
      lineHeight: '2'
    },
    footerCta: {
      padding: '4rem 0',
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      margin: '2rem 0'
    },
    // Media queries
    '@media (min-width: 768px)': {
      hero: {
        flexDirection: 'row',
        textAlign: 'left'
      }
    }
  };

  return (
    <div style={styles.homepage}>
      {/* Hero Section */}
      <header style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>TaskPulse Alerts</h1>
          <p style={styles.tagline}>
            Never miss a task deadline again with instant SMS notifications
          </p>
          <div style={styles.ctaButtons}>
            {user ? (
              <Link
                to="/tasks"
                style={{ ...styles.btn, ...styles.btnPrimary }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = styles.btnPrimaryHover.backgroundColor)}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = styles.btnPrimary.backgroundColor)}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                  onMouseOver={e => (e.currentTarget.style.backgroundColor = styles.btnPrimaryHover.backgroundColor)}
                  onMouseOut={e => (e.currentTarget.style.backgroundColor = styles.btnPrimary.backgroundColor)}
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  style={{ ...styles.btn, ...styles.btnSecondary }}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
        <div style={styles.heroImage}>
          <img 
            src="/images/task-management.svg" 
            alt="Task management illustration" 
            style={styles.heroImg}
          />
        </div>
      </header>

      {/* Features Section */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Why Choose TaskPulse?</h2>
        <div style={styles.featureGrid}>
          <div 
            style={styles.featureCard}
            onMouseOver={e => (e.currentTarget.style.transform = styles.featureCardHover.transform)}
            onMouseOut={e => (e.currentTarget.style.transform = 'none')}
          >
            <div style={styles.featureIcon}>📅</div>
            <h3>Deadline Alerts</h3>
            <p>Get SMS notifications before important deadlines</p>
          </div>
          <div 
            style={styles.featureCard}
            onMouseOver={e => (e.currentTarget.style.transform = styles.featureCardHover.transform)}
            onMouseOut={e => (e.currentTarget.style.transform = 'none')}
          >
            <div style={styles.featureIcon}>📱</div>
            <h3>Mobile Friendly</h3>
            <p>Manage tasks from anywhere, anytime</p>
          </div>
          <div 
            style={styles.featureCard}
            onMouseOver={e => (e.currentTarget.style.transform = styles.featureCardHover.transform)}
            onMouseOut={e => (e.currentTarget.style.transform = 'none')}
          >
            <div style={styles.featureIcon}>🔒</div>
            <h3>Secure</h3>
            <p>Your data is always protected</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={styles.howItWorks}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <ol style={styles.steps}>
          <li>Create your free account</li>
          <li>Add tasks with due dates</li>
          <li>Receive SMS alerts before deadlines</li>
          <li>Never miss an important task again!</li>
        </ol>
      </section>

      {/* Footer CTA */}
      <section style={styles.footerCta}>
        <h2 style={styles.sectionTitle}>Ready to Boost Your Productivity?</h2>
        <Link
          to={user ? "/tasks" : "/register"}
          style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnLarge }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = styles.btnPrimaryHover.backgroundColor)}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = styles.btnPrimary.backgroundColor)}
        >
          {user ? "Go to Dashboard" : "Start Now - It's Free"}
        </Link>
      </section>
    </div>
  );
};

export default HomePage;