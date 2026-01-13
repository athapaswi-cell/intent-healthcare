import React from 'react';
import './AdminConfiguration.css';

interface AdminConfigurationProps {
  onCardClick?: (cardId: string) => void;
}

export default function AdminConfiguration({ onCardClick }: AdminConfigurationProps) {
  const adminCards = [
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage users and accounts',
      icon: '👥',
      iconColor: '#3b82f6' // Light blue
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: '⚙️',
      iconColor: '#f59e0b' // Golden/Amber
    },
    {
      id: 'subscription-billing',
      title: 'Subscription & Billing',
      description: 'Manage plans and billing',
      icon: '📄',
      iconColor: '#f59e0b' // Golden/Amber
    },
    {
      id: 'roles-permissions',
      title: 'Roles & Permissions, Audit Logs',
      description: 'Define roles and review activity logs',
      icon: '🛡️',
      iconColor: '#8b5cf6' // Purple
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect with other services',
      icon: '🔗',
      iconColor: '#10b981' // Green
    },
    {
      id: 'security-settings',
      title: 'Security Settings',
      description: 'Configure security options',
      icon: '🔒',
      iconColor: '#10b981' // Green
    }
  ];

  const handleCardClick = (cardId: string) => {
    if (onCardClick) {
      onCardClick(cardId);
    } else {
      console.log('Card clicked:', cardId);
    }
  };

  return (
    <div className="admin-config-container">
      <div className="admin-config-header">
        <h1>Admin & Configuration</h1>
      </div>

      <div className="admin-config-grid">
        {adminCards.map((card) => (
          <div
            key={card.id}
            className="admin-config-card"
            onClick={() => handleCardClick(card.id)}
          >
            <div className="admin-card-icon" style={{ color: card.iconColor }}>
              {card.icon}
            </div>
            <div className="admin-card-content">
              <h3 className="admin-card-title">{card.title}</h3>
              <p className="admin-card-description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

