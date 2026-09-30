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

  // Abstraction: เมธอดต้นแบบ บังคับให้คลาสลูกต้อง Override
  calculateSalary() {
    throw new Error("เมธอด calculateSalary() ต้องถูกเขียนทับในคลาสลูก");
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

  getDetails() {
    return `${this.#hoursWorked} ชม. × ${this.#hourlyRate.toLocaleString()} บ./ชม.`;
  }

  toJSON() {
    return { ...super.toJSON(), hoursWorked: this.#hoursWorked, hourlyRate: this.#hourlyRate };
  }
}

// ========================================================
// 4. คลาสลูก 3: ContractEmployee (คลาสที่ 5 เพื่อให้ครบเกณฑ์ ≥ 5 คลาส)
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

// สร้าง Instance กลางสำหรับหน้าเว็บ
const payrollManager = new PayrollManager();