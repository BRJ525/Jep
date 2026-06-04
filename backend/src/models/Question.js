class Question {
  constructor(id, category, value, text, answer) {
    this.id = id;
    this.category = category;
    this.value = value;
    this.text = text;
    this.answer = answer;
    this.used = false;
  }
}

export default Question;