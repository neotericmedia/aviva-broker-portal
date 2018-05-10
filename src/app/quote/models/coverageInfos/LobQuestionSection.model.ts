import { LobQuestion } from '../LobQuestion.model';
import { LobAnswer } from '../coverageInfos/LobAnswer.model';

export class LobQuestionSection {
    public title: string;
    public lobCode: string;
    public subsections: LobQuestionSubsection[] = [];

    constructor(lobCode: string, lobQuestion: LobQuestion) {
      this.title = lobQuestion.Locale.QuestionTitle;
      this.lobCode = lobCode;
      this.subsections.push(new LobQuestionSubsection());
    }
}

export class LobQuestionSubsection {
  public title?: string;
  public asyncTask?: any;
  public questions: LobQuestion[] = [];
  public initialAnswers: LobAnswer[] = [];
}
