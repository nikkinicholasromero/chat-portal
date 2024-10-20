import {Component, Input} from "@angular/core";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="hidden px-4 py-2 rounded rounded-l border border-emerald-500 bg-emerald-100 text-emerald-500 text-sm"></div>
    <div class="hidden px-4 py-2 rounded rounded-l border border-amber-500 bg-amber-100 text-amber-500 text-sm"></div>
    <div class="hidden px-4 py-2 rounded rounded-l border border-rose-500 bg-rose-100 text-rose-500 text-sm"></div>
    <div class="hidden px-4 py-2 rounded rounded-l border border-gray-500 bg-gray-100 text-gray-500 text-sm"></div>

    <div class="px-4 py-2 rounded rounded-l border border-{{color()}}-500 bg-{{color()}}-100 text-{{color()}}-500 text-sm">
      <p>{{ message }}</p>
    </div>
  `
})
export class AlertComponent {
  @Input()
  message = "";

  @Input()
  messageType: "" | "SUCCESS" | "DANGER" | "WARNING" | "SECONDARY" = "";

  color() {
    if (this.messageType == "SUCCESS") {
      return "emerald";
    }

    if (this.messageType == "WARNING") {
      return "amber";
    }

    if (this.messageType == "DANGER") {
      return "rose";
    }

    return "gray"
  }
}
