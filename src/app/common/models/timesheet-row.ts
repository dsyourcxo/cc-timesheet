import { Item } from './board';

export class TimesheetRow {
  project: null | Item;
  selectedProjectId: null | any;
  itemGroupMap: Map<string, Item[]>;
  selectedItem: null | Item;
  selectGroup: null | any;
  taskStatus: null | any;
  estimatedTime: null | any;
  timeSpentTillDate: null | any;
  activityType: null | any;
  comment: null | any;
  manHoursSpent: null | any;
  labours: any[];
  deflautlabours: any[];
  materialDetails: null | any;
  activityArray: any[];
  statusCheckBox: string;
  isStatusCheckBox: boolean;
  showMarkCompletedCol: boolean;
  items: any[];
  isMaterialFilled: boolean;
  actualActivityType: null | any;
  isComment: boolean;
  isManhourSpent: boolean;
  isLabours: boolean;
  groups: any[];
  timePerProject: any[];

  constructor() {
    this.project = null;
    this.selectedProjectId = null;
    this.itemGroupMap = new Map();
    this.selectedItem = null;
    this.selectGroup = null;
    this.taskStatus = null;
    this.estimatedTime = null;
    this.timeSpentTillDate = null;
    this.activityType = null;
    this.comment = null;
    this.manHoursSpent = null;
    this.labours = [];
    this.materialDetails = null;
    this.activityArray = [];
    this.statusCheckBox = '';
    this.isStatusCheckBox = false;
    this.showMarkCompletedCol = false;
    this.deflautlabours = [];
    this.items = [];
    this.isMaterialFilled = false;
    this.actualActivityType = null;
    this.isComment = true;
    this.isManhourSpent = true;
    this.isLabours = true;
    this.groups = [];
    this.timePerProject = [];
  }
}
