import React from 'react'
import { EMERGENCY_CONTACTS } from '../utils/constants'

const EmergencyContacts = () => {
  const contacts = EMERGENCY_CONTACTS.us
  const resources = EMERGENCY_CONTACTS.emergencyResources

  return (
    <div className="emergency-contacts">
      <h2>🚨 Emergency Contacts</h2>
      
      <div className="contact-grid">
        <div className="contact-item">
          <strong>Ambulance:</strong> {contacts.ambulance}
        </div>
        <div className="contact-item">
          <strong>Police:</strong> {contacts.police}
        </div>
        <div className="contact-item">
          <strong>Fire:</strong> {contacts.fire}
        </div>
        <div className="contact-item">
          <strong>Poison Control:</strong> {contacts.poison}
        </div>
        <div className="contact-item">
          <strong>Suicide Hotline:</strong> {contacts.suicideHotline}
        </div>
      </div>

      <h3>Mental Health Resources</h3>
      {resources.map((resource, index) => (
        <div key={index} className="resource-item">
          <strong>{resource.name}</strong>
          <p>{resource.number}</p>
          <p>{resource.description}</p>
          <small>{resource.available}</small>
        </div>
      ))}
    </div>
  )
}