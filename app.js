// ========================================================
// 1. คลาสแม่: Employee (Abstraction & Encapsulation)
// ========================================================
class Employee {
  #id;    // Encapsulation: Private Field
  #name;  // Encapsulation: Private Field
  #type;  // Encapsulation: Private Field

  constructor(id, name, type) {
    if (this.constructor === Employee) {
      throw new Error("ไม่สามารถสร้างอ็อบเจกต์จาก Abstract Class 'Employee' ได้โดยตรง");
    }
    this.#id = id;
    this.#name = name;
    this.#type = type;
  }

  // Getter Methods
  getId() { return this.#id; }
  getName() { return this.#name; }
  getType() { return this.#type; }

  // Setter (ใหม่): แก้ไขชื่อได้ แต่ id และ type ห้ามแก้ (ไม่มี setter)
  setName(name) { this.#name = name; }

  // Abstraction: เมธอดต้นแบบ บังคับให้คลาสลูกต้อง Override
  calculateSalary() {
    throw new Error("เมธอด calculateSalary() ต้องถูกเขียนทับในคลาสลูก");
  }

  // Abstraction (ใหม่): เมธอดสำหรับแก้ไขข้อมูล คลาสลูกต้อง Override
  update(data) {
    throw new Error("เมธอด update() ต้องถูกเขียนทับในคลาสลูก");
  }

  getDetails() { return "-"; }

  toJSON() {
    return { id: this.#id, name: this.#name, type: this.#type };
  }
}

// ========================================================
// 2. คลาสลูก 1: FullTimeEmployee (Inheritance & Polymorphism)
// ========================================================
class FullTimeEmployee extends Employee {
  #monthlySalary;

  constructor(id, name, monthlySalary) {
    super(id, name, "FullTime"); // Inheritance
    this.#monthlySalary = Number(monthlySalary);
  }

  // Polymorphism: Override เมธอดของคลาสแม่
  calculateSalary() {
    return this.#monthlySalary;
  }

  // Polymorphism (ใหม่): แก้ไขเฉพาะข้อมูลของพนักงานประจำ
  update(data) {
    this.setName(data.name);
    this.#monthlySalary = Number(data.monthlySalary);
  }

  getDetails() {
    return `เงินเดือนฐาน: ${this.#monthlySalary.toLocaleString()} บาท`;
  }

  toJSON() {
    return { ...super.toJSON(), monthlySalary: this.#monthlySalary };
  }
}

// ========================================================
// 3. คลาสลูก 2: PartTimeEmployee (Inheritance & Polymorphism)
// ========================================================
class PartTimeEmployee extends Employee {
  #hoursWorked;
  #hourlyRate;

  constructor(id, name, hoursWorked, hourlyRate) {
    super(id, name, "PartTime"); // Inheritance
    this.#hoursWorked = Number(hoursWorked);
    this.#hourlyRate = Number(hourlyRate);
  }

  // Polymorphism: คิดเงินตามชั่วโมง x ค่าจ้าง
  calculateSalary() {
    return this.#hoursWorked * this.#hourlyRate;
  }

  // Polymorphism (ใหม่)
  update(data) {
    this.setName(data.name);
    this.#hoursWorked = Number(data.hoursWorked);
    this.#hourlyRate = Number(data.hourlyRate);
  }

  getDetails() {
    return `${this.#hoursWorked} ชม. × ${this.#hourlyRate.toLocaleString()} บ./ชม.`;
  }

  toJSON() {
    return { ...super.toJSON(), hoursWorked: this.#hoursWorked, hourlyRate: this.#hourlyRate };
  }
}

// ========================================================
// 4. คลาสลูก 3: ContractEmployee
// ========================================================
class ContractEmployee extends Employee {
  #projectFee;
  #projectName;

  constructor(id, name, projectFee, projectName) {
    super(id, name, "Contract"); // Inheritance
    this.#projectFee = Number(projectFee);
    this.#projectName = projectName;
  }

  // Polymorphism: ค่าจ้างเหมาจ่ายตามโปรเจกต์
  calculateSalary() {
    return this.#projectFee;
  }

  // Polymorphism (ใหม่)
  update(data) {
    this.setName(data.name);
    this.#projectFee = Number(data.projectFee);
    this.#projectName = data.projectName;
  }

  getDetails() {
    return `ค่าจ้างโปรเจกต์: "${this.#projectName}" (${this.#projectFee.toLocaleString()} บาท)`;
  }

  toJSON() {
    return { ...super.toJSON(), projectFee: this.#projectFee, projectName: this.#projectName };
  }
}

// ========================================================
// 5. คลาสจัดการระบบ: PayrollManager (Data Management & Storage)
// ========================================================
class PayrollManager {
  #employees;

  constructor() {
    this.#employees = [];
    this.loadFromStorage();
  }

  loadFromStorage() {
    const rawData = localStorage.getItem("payroll_employees");
    if (!rawData) {
      // Mock Data ตั้งต้น
      this.#employees = [
        new FullTimeEmployee("EMP01", "สมชาย ใจดี", 30000),
        new FullTimeEmployee("EMP02", "วิภา รัตนพงษ์", 35000),
        new PartTimeEmployee("EMP03", "กิตติพงษ์ สว่างจิต", 45, 120),
        new ContractEmployee("EMP04", "ธนภัทร นักพัฒนา", 25000, "พัฒนาระบบหลังบ้าน")
      ];
      this.saveToStorage();
    } else {
      const parsed = JSON.parse(rawData);
      this.#employees = parsed.map(item => {
        if (item.type === "FullTime") {
          return new FullTimeEmployee(item.id, item.name, item.monthlySalary);
        } else if (item.type === "PartTime") {
          return new PartTimeEmployee(item.id, item.name, item.hoursWorked, item.hourlyRate);
        } else {
          return new ContractEmployee(item.id, item.name, item.projectFee, item.projectName);
        }
      });
    }
  }

  saveToStorage() {
    const serialized = this.#employees.map(emp => emp.toJSON());
    localStorage.setItem("payroll_employees", JSON.stringify(serialized));
  }

  addEmployee(employee) {
    this.#employees.push(employee);
    this.saveToStorage();
  }

  removeEmployee(id) {
    this.#employees = this.#employees.filter(emp => emp.getId() !== id);
    this.saveToStorage();
  }

  // (ใหม่) ค้นหาพนักงานจากรหัส คืนค่า undefined ถ้าไม่พบ
  findById(id) {
    return this.#employees.find(emp => emp.getId() === id);
  }

  // (ใหม่) แก้ไขข้อมูลพนักงาน แล้วบันทึกลง LocalStorage
  // คืนค่า true ถ้าแก้ไขสำเร็จ, false ถ้าไม่พบรหัสนี้
  updateEmployee(id, data) {
    const emp = this.findById(id);
    if (!emp) return false;
    emp.update(data); // Polymorphism: แต่ละ subclass แก้ไขข้อมูลของตัวเอง
    this.saveToStorage();
    return true;
  }

  getAll() {
    return this.#employees;
  }

  // Polymorphism ชัดเจนที่สุด: ลูปคำนวณเงินเดือนรวมได้ทันที
  calculateTotalBudget() {
    return this.#employees.reduce((sum, emp) => sum + emp.calculateSalary(), 0);
  }

  countByType(typeClass) {
    return this.#employees.filter(emp => emp instanceof typeClass).length;
  }
}

// ========================================================
// 6. (ใหม่) คลาสจัดการการเข้าสู่ระบบ: AuthService
// ========================================================
class AuthService {
  #users;       // รายชื่อผู้ใช้ (เก็บในโค้ด เพราะโปรเจกต์ไม่ใช้ฐานข้อมูล)
  #sessionKey;  // ชื่อ key ที่ใช้เก็บสถานะการล็อกอิน

  constructor() {
    this.#users = [
      { username: "admin", password: "admin123", displayName: "ผู้ดูแลระบบ" },
      { username: "hr", password: "hr1234", displayName: "ฝ่ายบุคคล" }
    ];
    this.#sessionKey = "payroll_session";
  }

  // ตรวจสอบ username/password ถ้าถูกต้องให้บันทึก session แล้วคืนค่า true
  login(username, password) {
    const user = this.#users.find(u => u.username === username && u.password === password);
    if (!user) return false;
    // sessionStorage: ข้อมูลหายเมื่อปิดแท็บ/เบราว์เซอร์
    sessionStorage.setItem(
      this.#sessionKey,
      JSON.stringify({ username: user.username, displayName: user.displayName })
    );
    return true;
  }

  logout() {
    sessionStorage.removeItem(this.#sessionKey);
  }

  getCurrentUser() {
    const raw = sessionStorage.getItem(this.#sessionKey);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  // เรียกในทุกหน้าที่ต้องล็อกอิน ถ้ายังไม่ล็อกอินให้เด้งไปหน้า login
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.replace("login.html");
      return false;
    }
    return true;
  }
}

// สร้าง Instance กลางสำหรับหน้าเว็บ
const payrollManager = new PayrollManager();
const authService = new AuthService();

// ========================================================
// ฟังก์ชันช่วยสำหรับแถบเมนู (ใช้ร่วมกันทุกหน้า)
// ========================================================
function setupNavbar() {
  if (!authService.requireLogin()) return false;
  const nameEl = document.getElementById("user-name");
  if (nameEl) nameEl.innerText = "👤 " + authService.getCurrentUser().displayName;
  return true;
}

function logout() {
  authService.logout();
  window.location.href = "login.html";
}
