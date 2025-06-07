import { MathInputter } from "@/components/math-inputter/MathInputter";

export class MathInputterBuilder {
    static build(): MathInputter {
        const mathInputter = MathInputter.getInstance();
        return mathInputter;
    }
}
