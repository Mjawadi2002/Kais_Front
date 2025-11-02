import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BsGlobe, BsFlag, BsFlagFill } from 'react-icons/bs';

const LanguageSwitcher = ({ variant = 'outline-primary', size = 'sm' }) => {
  const { i18n, t } = useTranslation();

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      icon: <BsFlag className="me-1" />
    },
    {
      code: 'fr', 
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
      icon: <BsFlagFill className="me-1" />
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant={variant} 
        size={size}
        id="language-dropdown"
        className="d-flex align-items-center"
      >
        <BsGlobe className="me-1" />
        <span className="d-none d-md-inline me-1">{currentLanguage.nativeName}</span>
        <span className="d-inline d-md-none">{currentLanguage.flag}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>
          <BsGlobe className="me-2" />
          Choose Language / Choisir la langue
        </Dropdown.Header>
        <Dropdown.Divider />
        {languages.map((language) => (
          <Dropdown.Item
            key={language.code}
            active={language.code === i18n.language}
            onClick={() => changeLanguage(language.code)}
            className="d-flex align-items-center"
          >
            <span className="me-2" style={{ fontSize: '1.2em' }}>{language.flag}</span>
            {language.icon}
            <div>
              <div className="fw-medium">{language.nativeName}</div>
              <small className="text-muted">{language.name}</small>
            </div>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;