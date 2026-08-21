import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'db_store.json');

// Default initial state with complete Main Admin credentials
const defaultStore = {
  users: [],
  admins: [
    {
      id: '1',
      name: 'Main Admin',
      username: 'mainadmin',
      email: 'kavinselvaraj12@gmail.com',
      role: 'MAIN_ADMIN',
      created_at: new Date().toISOString()
    }
  ],
  cases: [],
  settings: {
    profile: {
      name: 'Main Admin',
      email: 'kavinselvaraj12@gmail.com',
      mobile: '+91 98765 43210'
    },
    office: {
      lawChambersName: 'DIGI LAW REPORTER CHAMBERS & LEGAL RESEARCH CENTRE',
      officeAddress: 'Chamber No. 402, High Court Lawyers Block, Supreme Court Enclave, New Delhi - 110001',
      primaryPhone: '+91 98765 43210',
      secondaryPhone: '+91 11 2345 6789',
      primaryEmail: 'contact@digilawreporter.in',
      secondaryEmail: 'support@digilawreporter.in',
      workingHours: 'Monday to Saturday: 9:00 AM - 7:00 PM'
    },
    aboutPage: {
      pageHeading: 'Pioneering Digital Legal Intelligence & Supreme Court Precedents',
      pageSubheading: 'Empowering Advocates, Judiciary Members & Legal Researchers with Authentic Case Law Insights',
      aboutParagraph1: 'Digi Law Reporter is India’s premier digital legal reporting platform dedicated to publishing authentic, verified Supreme Court and High Court precedents with full citation authority.',
      aboutParagraph2: 'Engineered by Advocate on Record practitioners, our mission is to make comprehensive legal search instantaneous, reliable, and accessible across the country.',
      founder1Name: 'Adv. Rajesh Sharma',
      founder1Title: 'Founder & Senior Advocate',
      founder1Court: 'Supreme Court of India',
      founder1Experience: '24+ Years Experience',
      founder1BarNo: 'D/1482/2000',
      founder1Bio: 'Senior Advocate specializing in Constitutional Law, Civil Appeals & Special Leave Petitions.',
      founder1Image: '',
      founder2Name: 'Adv. Priya Venkatesh',
      founder2Title: 'Co-Founder & Advocate on Record',
      founder2Court: 'Supreme Court of India',
      founder2Experience: '18+ Years Experience',
      founder2BarNo: 'D/892/2006',
      founder2Bio: 'Advocate on Record with extensive practice in Commercial Arbitration and Corporate Precedents.',
      founder2Image: ''
    }
  }
};

class LocalStore {
  constructor() {
    this.ensureStore();
  }

  ensureStore() {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultStore, null, 2));
    }
  }

  read() {
    try {
      this.ensureStore();
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(content);
      if (!data.admins || data.admins.length === 0) {
        data.admins = defaultStore.admins;
      } else {
        // Ensure Main Admin email is kavinselvaraj12@gmail.com
        const mainIdx = data.admins.findIndex(a => a.role === 'MAIN_ADMIN' || String(a.id) === '1');
        if (mainIdx >= 0) {
          data.admins[mainIdx].email = 'kavinselvaraj12@gmail.com';
          data.admins[mainIdx].role = 'MAIN_ADMIN';
        }
      }
      if (!data.settings) {
        data.settings = defaultStore.settings;
      }
      return data;
    } catch (e) {
      return defaultStore;
    }
  }

  write(data) {
    try {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Error writing localStore:', e);
    }
  }

  // User methods
  getUsers() {
    const users = this.read().users || [];
    return [...users].sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  addUser(user) {
    const store = this.read();
    if (!store.users) store.users = [];
    const existingIdx = store.users.findIndex(u => u.mobile === user.mobile);
    const now = new Date().toISOString();

    if (existingIdx >= 0) {
      store.users[existingIdx].name = user.name || store.users[existingIdx].name;
      store.users[existingIdx].last_login = now;
      const updatedUser = store.users[existingIdx];
      this.write(store);
      return updatedUser;
    } else {
      const newUser = {
        id: Date.now(),
        name: user.name,
        mobile: user.mobile,
        email: user.email || `${user.mobile}@digilawreporter.in`,
        status: 'Active',
        joined_date: now.split('T')[0],
        last_login: now
      };
      store.users.unshift(newUser);
      this.write(store);
      return newUser;
    }
  }

  getUserSavedCases(identifier) {
    const store = this.read();
    const users = store.users || [];
    const u = users.find(u => u.mobile === identifier || String(u.id) === String(identifier) || u.email === identifier);
    return u && Array.isArray(u.saved_cases) ? u.saved_cases : [];
  }

  saveUserCases(identifier, cases) {
    const store = this.read();
    if (!store.users) store.users = [];
    const uIdx = store.users.findIndex(u => u.mobile === identifier || String(u.id) === String(identifier) || u.email === identifier);
    if (uIdx >= 0) {
      store.users[uIdx].saved_cases = cases;
      this.write(store);
      return store.users[uIdx].saved_cases;
    }
    return cases;
  }

  // Admin methods
  getAdmins() {
    const store = this.read();
    const admins = store.admins || defaultStore.admins;
    return admins.map(a => {
      const { password, password_hash, ...sanitized } = a;
      return sanitized;
    });
  }

  addAdmin(adminData) {
    const store = this.read();
    if (!store.admins) store.admins = [];
    const passwordHash = adminData.password_hash || (adminData.password ? bcrypt.hashSync(adminData.password, 10) : '');
    const newAdmin = {
      id: Date.now().toString(),
      name: adminData.name,
      username: adminData.username.toLowerCase().trim(),
      email: `${adminData.username.toLowerCase().trim()}@digilawreporter.in`,
      password_hash: passwordHash,
      role: adminData.role || 'EXTRA_ADMIN',
      created_at: new Date().toISOString()
    };
    store.admins.push(newAdmin);
    this.write(store);
    const { password, password_hash, ...sanitized } = newAdmin;
    return sanitized;
  }

  updateAdminPassword(id, newPassword) {
    return this.updateAdminCredentials(id, { password: newPassword });
  }

  updateAdminCredentials(id, { username, password, password_hash, email }) {
    const store = this.read();
    if (!store.admins) store.admins = [];
    const idx = store.admins.findIndex(a => String(a.id) === String(id) || (a.role === 'MAIN_ADMIN' && String(id) === '1'));
    if (idx >= 0) {
      if (username) store.admins[idx].username = username.toLowerCase().trim();
      if (email) store.admins[idx].email = email.toLowerCase().trim();
      if (store.admins[idx].role === 'MAIN_ADMIN') {
        store.admins[idx].email = 'kavinselvaraj12@gmail.com';
      }
      if (password) {
        store.admins[idx].password_hash = bcrypt.hashSync(password, 10);
        delete store.admins[idx].password;
      }
      if (password_hash) {
        store.admins[idx].password_hash = password_hash;
        delete store.admins[idx].password;
      }
      this.write(store);
      const { password: p, password_hash: ph, ...sanitized } = store.admins[idx];
      return sanitized;
    }
    return null;
  }

  deleteAdmin(id) {
    const store = this.read();
    if (!store.admins) store.admins = [];
    const target = store.admins.find(a => String(a.id) === String(id));
    if (target && target.role === 'MAIN_ADMIN') {
      return false; // Main Admin cannot be deleted
    }
    store.admins = store.admins.filter(a => String(a.id) !== String(id));
    this.write(store);
    return true;
  }

  // Password Reset Token methods
  saveResetToken({ adminId, tokenHash, expiresAt }) {
    const store = this.read();
    if (!store.resetTokens) store.resetTokens = [];
    // Clean up older tokens for this admin
    store.resetTokens = store.resetTokens.filter(t => String(t.adminId) !== String(adminId));
    store.resetTokens.push({
      adminId: String(adminId),
      tokenHash,
      expiresAt: new Date(expiresAt).toISOString(),
      used: false,
      createdAt: new Date().toISOString()
    });
    this.write(store);
  }

  getResetToken(tokenHash) {
    const store = this.read();
    if (!store.resetTokens) return null;
    return store.resetTokens.find(t => t.tokenHash === tokenHash) || null;
  }

  markResetTokenUsed(tokenHash) {
    const store = this.read();
    if (!store.resetTokens) return;
    const idx = store.resetTokens.findIndex(t => t.tokenHash === tokenHash);
    if (idx >= 0) {
      store.resetTokens[idx].used = true;
      this.write(store);
    }
  }

  // Admin Session methods
  saveAdminSession(sessionData) {
    const store = this.read();
    if (!store.adminSessions) store.adminSessions = [];
    store.adminSessions = store.adminSessions.filter(s => s.sessionId !== sessionData.sessionId && String(s.adminId) !== String(sessionData.adminId));
    store.adminSessions.push(sessionData);
    this.write(store);
  }

  getAdminSession(sessionId) {
    const store = this.read();
    if (!store.adminSessions) return null;
    return store.adminSessions.find(s => s.sessionId === sessionId) || null;
  }

  deleteAdminSession(sessionId) {
    const store = this.read();
    if (!store.adminSessions) return;
    store.adminSessions = store.adminSessions.filter(s => s.sessionId !== sessionId);
    this.write(store);
  }

  ensureMainAdmin({ email, password_hash, role }) {
    const store = this.read();
    if (!store.admins) store.admins = [];
    const mainIdx = store.admins.findIndex(a => a.role === 'MAIN_ADMIN' || String(a.id) === '1' || a.email === email);

    if (mainIdx >= 0) {
      store.admins[mainIdx].email = email;
      store.admins[mainIdx].role = 'MAIN_ADMIN';
      if (!store.admins[mainIdx].password_hash || password_hash) {
        store.admins[mainIdx].password_hash = password_hash;
      }
    } else {
      store.admins.unshift({
        id: '1',
        name: 'Main Admin',
        username: 'mainadmin',
        email: email,
        role: 'MAIN_ADMIN',
        password_hash: password_hash,
        created_at: new Date().toISOString()
      });
    }
    this.write(store);
  }

  // Settings methods
  getSettings() {
    const store = this.read();
    return store.settings || defaultStore.settings;
  }

  saveSettings(settingsData) {
    const store = this.read();
    store.settings = {
      ...store.settings,
      ...settingsData
    };
    this.write(store);
    return store.settings;
  }

  // Cases methods
  getCases(statusFilter) {
    const cases = this.read().cases || [];
    if (statusFilter) {
      return cases.filter(c => (c.status || 'Published') === statusFilter);
    }
    return cases;
  }

  getCaseById(id) {
    const cases = this.read().cases || [];
    return cases.find(c => String(c.id) === String(id)) || null;
  }

  addCase(caseData) {
    const store = this.read();
    if (!store.cases) store.cases = [];
    
    const num = (caseData.caseNumber || caseData.case_number || '').trim();
    const titleVal = (caseData.title || '').trim() || (caseData.petitioner && caseData.respondent ? `${caseData.petitioner} vs. ${caseData.respondent}` : (num || 'Untitled Case Record'));
    const dateVal = caseData.judgmentDate || caseData.judgment_date || new Date().toISOString().split('T')[0];
    const yearVal = caseData.year || (dateVal ? dateVal.substring(0, 4) : '2026');
    const headNoteVal = caseData.headNote || caseData.summary || caseData.head_note || '';
    const judgmentTextVal = caseData.judgmentText || caseData.content || caseData.judgment_text || '';
    const statusVal = caseData.status || 'Published';
    const citationsVal = caseData.citations || [];

    const newCase = {
      id: Date.now(),
      case_number: num,
      caseNumber: num,
      title: titleVal,
      petitioner: caseData.petitioner || '',
      petitioner_name: caseData.petitioner || '',
      respondent: caseData.respondent || '',
      respondent_name: caseData.respondent || '',
      court: caseData.court || 'Supreme Court of India',
      court_name: caseData.court || 'Supreme Court of India',
      judgment_date: dateVal,
      judgmentDate: dateVal,
      year: yearVal,
      act: caseData.act || '',
      section: caseData.section || '',
      head_note: headNoteVal,
      summary: headNoteVal,
      headNote: headNoteVal,
      judgment_text: judgmentTextVal,
      content: judgmentTextVal,
      judgmentText: judgmentTextVal,
      status: statusVal,
      citations: citationsVal
    };

    store.cases.unshift(newCase);
    this.write(store);
    return newCase;
  }

  updateCase(id, caseData) {
    const store = this.read();
    if (!store.cases) store.cases = [];
    const idx = store.cases.findIndex(c => String(c.id) === String(id));
    if (idx >= 0) {
      const existing = store.cases[idx];
      const caseNum = caseData.caseNumber !== undefined ? caseData.caseNumber : (caseData.case_number !== undefined ? caseData.case_number : (existing.caseNumber || existing.case_number || ''));
      const pet = caseData.petitioner !== undefined ? caseData.petitioner : (caseData.petitioner_name !== undefined ? caseData.petitioner_name : existing.petitioner);
      const resp = caseData.respondent !== undefined ? caseData.respondent : (caseData.respondent_name !== undefined ? caseData.respondent_name : existing.respondent);
      const crt = caseData.court !== undefined ? caseData.court : (caseData.court_name !== undefined ? caseData.court_name : existing.court);
      const dt = caseData.judgmentDate !== undefined ? caseData.judgmentDate : (caseData.judgment_date !== undefined ? caseData.judgment_date : existing.judgmentDate);
      const yr = caseData.year !== undefined ? caseData.year : (dt ? dt.substring(0, 4) : (existing.year || '2026'));
      const head = caseData.headNote !== undefined ? caseData.headNote : (caseData.summary !== undefined ? caseData.summary : (caseData.head_note !== undefined ? caseData.head_note : existing.head_note));
      const jText = caseData.judgmentText !== undefined ? caseData.judgmentText : (caseData.content !== undefined ? caseData.content : (caseData.judgment_text !== undefined ? caseData.judgment_text : existing.judgment_text));
      const ttl = caseData.title !== undefined && caseData.title.trim() ? caseData.title.trim() : (pet && resp ? `${pet} vs. ${resp}` : existing.title);
      const stat = caseData.status !== undefined ? caseData.status : existing.status;
      const cits = caseData.citations !== undefined ? caseData.citations : existing.citations;

      const updated = {
        ...existing,
        ...caseData,
        id: existing.id,
        case_number: caseNum,
        caseNumber: caseNum,
        title: ttl,
        petitioner: pet,
        petitioner_name: pet,
        respondent: resp,
        respondent_name: resp,
        court: crt,
        court_name: crt,
        judgment_date: dt,
        judgmentDate: dt,
        year: yr,
        act: caseData.act !== undefined ? caseData.act : existing.act,
        section: caseData.section !== undefined ? caseData.section : existing.section,
        head_note: head,
        summary: head,
        headNote: head,
        judgment_text: jText,
        content: jText,
        judgmentText: jText,
        status: stat,
        citations: cits,
        updated_at: new Date().toISOString()
      };
      store.cases[idx] = updated;
      this.write(store);
      return updated;
    }
    return null;
  }

  deleteCase(id) {
    const store = this.read();
    if (!store.cases) store.cases = [];
    store.cases = store.cases.filter(c => String(c.id) !== String(id));
    this.write(store);
    return true;
  }

  checkCitationExists(number, year, month = null, excludeId = null) {
    if (!number) return false;
    const cleanNum = String(number).replace(/[^0-9a-zA-Z]/g, '').trim().toLowerCase();
    if (!cleanNum) return false;

    const cleanYr = year ? String(year).trim() : null;
    const cleanMo = month ? String(month).trim().replace(/^0+/, '') : null;

    const cases = this.read().cases || [];

    return cases.some(c => {
      if (excludeId && String(c.id) === String(excludeId)) return false;

      const cits = Array.isArray(c.citations) ? c.citations : [];
      const matchCit = cits.some(cit => {
        const citNum = String(cit.number || cit.count || cit.dlrNumber || '').replace(/[^0-9a-zA-Z]/g, '').trim().toLowerCase();
        const numMatch = (citNum === cleanNum);

        const citYr = cit.year ? String(cit.year).trim() : '';
        const yrMatch = !cleanYr || citYr === cleanYr;

        let moMatch = true;
        if (cleanMo) {
          const citMo = cit.month ? String(cit.month).trim().replace(/^0+/, '') : '';
          moMatch = !citMo || citMo === cleanMo;
        }

        return numMatch && yrMatch && moMatch;
      });

      const citStr = String(c.citation || c.citations_string || '').toLowerCase();
      const numInStr = citStr.includes(`#${cleanNum}`) || citStr.includes(` ${cleanNum}`) || citStr.includes(`(${cleanNum})`);
      const yrInStr = !cleanYr || citStr.includes(cleanYr);
      let moInStr = true;
      if (cleanMo) {
        const formattedMoPadded = cleanMo.padStart(2, '0');
        moInStr = citStr.includes(`(${cleanMo})`) || citStr.includes(`(${formattedMoPadded})`) || citStr.includes(` ${cleanMo} `) || citStr.includes(` ${formattedMoPadded} `);
      }

      const matchString = numInStr && yrInStr && moInStr;

      return matchCit || matchString;
    });
  }

  searchCases(keyword, tab = 'keyword') {
    const cases = this.read().cases || [];
    const publishedCases = cases.filter(c => (c.status || 'Published') === 'Published');
    if (!keyword || !keyword.trim()) return publishedCases;

    const rawTerm = keyword.trim();
    const cleanTerm = rawTerm.includes(':') ? rawTerm.split(':').slice(1).join(':').trim() : rawTerm;
    const lowerTerm = cleanTerm.toLowerCase();
    const mode = (tab || 'keyword').toLowerCase().trim();

    // Tokenize Citation Query
    const wordTokens = cleanTerm.split(/[\s,()#:]+/).filter(w => w.length > 0);
    const yearToken = wordTokens.find(w => /^(19|20)\d{2}$/.test(w));
    const numericTokens = wordTokens.filter(w => /^\d+$/.test(w) && w !== yearToken);

    let monthToken = null;
    let numberToken = null;

    if (numericTokens.length >= 2) {
      monthToken = numericTokens[0].replace(/^0+/, '');
      numberToken = numericTokens[1];
    } else if (numericTokens.length === 1) {
      const monthInBracketsMatch = cleanTerm.match(/\(\s*(0?[1-9]|1[0-2])\s*\)/);
      if (monthInBracketsMatch) {
        monthToken = monthInBracketsMatch[1].replace(/^0+/, '');
        numberToken = numericTokens[0] !== monthInBracketsMatch[1] ? numericTokens[0] : null;
      } else {
        numberToken = numericTokens[0];
      }
    }

    const isCitationQuery = mode === 'citation' || 
                            rawTerm.toLowerCase().startsWith('citation:') ||
                            Boolean(yearToken && numberToken) ||
                            Boolean(cleanTerm.toLowerCase().includes('dlr'));

    // 1. FIND BY CITATION
    if (isCitationQuery) {
      return publishedCases.filter(c => {
        const cits = Array.isArray(c.citations) ? c.citations : [];
        const citStr = String(c.citation || c.citations_string || '').toLowerCase();

        const matchesArray = cits.some(cit => {
          const citNum = String(cit.number || cit.count || cit.dlrNumber || '').replace(/[^0-9a-zA-Z]/g, '').trim().toLowerCase();
          const citYr = String(cit.year || '').trim();
          const citMo = cit.month ? String(cit.month).trim().replace(/^0+/, '') : '';

          const yrMatch = !yearToken || citYr === yearToken || (c.judgment_date && c.judgment_date.startsWith(yearToken));
          const numMatch = !numberToken || citNum === numberToken.toLowerCase();
          const moMatch = !monthToken || !citMo || citMo === monthToken;

          return yrMatch && numMatch && moMatch;
        });

        const yrInStr = !yearToken || citStr.includes(yearToken) || (c.judgment_date && c.judgment_date.startsWith(yearToken));
        const numInStr = !numberToken || citStr.includes(`#${numberToken}`) || citStr.endsWith(` ${numberToken}`) || citStr.includes(`(${numberToken})`) || citStr.includes(` ${numberToken} `);
        let moInStr = true;
        if (monthToken) {
          const paddedMo = monthToken.padStart(2, '0');
          moInStr = citStr.includes(`(${monthToken})`) || citStr.includes(`(${paddedMo})`) || citStr.includes(` ${monthToken} `) || citStr.includes(` ${paddedMo} `);
        }

        const matchesString = yrInStr && numInStr && moInStr;

        return matchesArray || matchesString;
      });
    }

    // 2. FIND BY SECTION / TITLE OR ACT
    if (mode === 'section' || mode === 'act' || mode === 'title' || mode === 'section_only') {
      const numMatch = cleanTerm.match(/\d+[a-zA-Z]*/);
      return publishedCases.filter(c => {
        const section = String(c.section || '').toLowerCase();
        const title = String(c.title || '').toLowerCase();
        const act = String(c.act || '').toLowerCase();

        if (section.includes(lowerTerm) || title.includes(lowerTerm) || act.includes(lowerTerm)) return true;
        if (numMatch && (section.includes(numMatch[0].toLowerCase()) || act.includes(numMatch[0].toLowerCase()))) return true;
        return false;
      });
    }

    // 3. FIND BY PARTY NAME
    if (mode === 'party') {
      let courtPart = null;
      let partyPart = rawTerm;

      if (rawTerm.includes(':')) {
        const parts = rawTerm.split(':');
        courtPart = parts[0].trim();
        partyPart = parts.slice(1).join(':').trim();
      }

      return publishedCases.filter(c => {
        // Court matching (if court specified)
        if (courtPart && courtPart !== '' && courtPart !== '---Select Court---') {
          const cCourt = String(c.court_name || c.court || '').toLowerCase();
          if (!cCourt.includes(courtPart.toLowerCase())) {
            return false;
          }
        }

        // Party / Title / Keyword matching (if party term specified)
        if (partyPart && partyPart !== '') {
          const lowerP = partyPart.toLowerCase();
          const pet = String(c.petitioner || c.petitioner_name || '').toLowerCase();
          const resp = String(c.respondent || c.respondent_name || '').toLowerCase();
          const title = String(c.title || '').toLowerCase();
          const caseNum = String(c.case_number || c.caseNumber || '').toLowerCase();

          return pet.includes(lowerP) || resp.includes(lowerP) || title.includes(lowerP) || caseNum.includes(lowerP);
        }

        // If court is selected and no party keyword, match all cases for that court
        return true;
      });
    }

    // 4. FIND BY TOPIC / PHRASE
    if (mode === 'topic' || mode === 'phrase') {
      return publishedCases.filter(c => {
        const headNote = String(c.head_note || c.summary || '').toLowerCase();
        const text = String(c.judgment_text || c.content || '').toLowerCase();
        const act = String(c.act || '').toLowerCase();
        return headNote.includes(lowerTerm) || text.includes(lowerTerm) || act.includes(lowerTerm);
      });
    }

    // GENERAL KEYWORD SEARCH
    return publishedCases.filter(c => {
      const fullText = `${c.title || ''} ${c.petitioner || ''} ${c.respondent || ''} ${c.case_number || ''} ${c.act || ''} ${c.section || ''} ${c.head_note || ''} ${c.judgment_text || ''} ${c.citation || ''}`.toLowerCase();
      return fullText.includes(lowerTerm);
    });
  }
}

export default new LocalStore();
