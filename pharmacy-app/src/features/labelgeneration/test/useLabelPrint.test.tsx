import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLabelPrint } from "../hooks/useLabelPrint";

import type { RefObject } from "react";
import type { DispenseLabel } from "../domain";

const toastMock = vi.hoisted(() => ({
  warning: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
}));

const loggerMock = vi.hoisted(() => ({
  error: vi.fn(),
}));

vi.mock("@shared/ui/toast", () => ({
  toast: toastMock,
}));

vi.mock("@core/logger/logger", () => ({
  logger: loggerMock,
}));

function createLabel(): DispenseLabel {
  return {
    dispenseId: "DSP-001",
    prescriptionId: "RX-001",
    patientId: "P-001",
    patientName: "John Doe",
    dispenseDate: "2026-03-11T15:36:46.220Z",
    status: "Paid",
    pharmacistId: "PH-001",
    items: [],
  };
}

function createRefFor(element: HTMLElement): RefObject<HTMLElement | null> {
  return { current: element };
}

describe("useLabelPrint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("warns when no dispense is selected", () => {
    const container = document.createElement("div");
    const { result } = renderHook(() =>
      useLabelPrint(null, createRefFor(container))
    );

    act(() => {
      result.current.print();
    });

    expect(toastMock.warning).toHaveBeenCalledWith(
      "No Dispense Selected",
      "Please select a dispense first."
    );
  });

  it("prints labels only from the preview container ref", () => {
    const container = document.createElement("div");
    const insideLabel = document.createElement("div");
    insideLabel.className = "print-label";
    insideLabel.textContent = "inside label";
    container.appendChild(insideLabel);

    const outsideLabel = document.createElement("div");
    outsideLabel.className = "print-label";
    outsideLabel.textContent = "outside label";
    document.body.appendChild(outsideLabel);

    const write = vi.fn();
    const close = vi.fn();

    vi.spyOn(window, "open").mockReturnValue({
      document: {
        write,
        close,
      },
    } as unknown as Window);

    const { result } = renderHook(() =>
      useLabelPrint(createLabel(), createRefFor(container))
    );

    act(() => {
      result.current.print();
    });

    const writtenHtml = write.mock.calls[0]?.[0] as string;

    expect(writtenHtml).toContain("inside label");
    expect(writtenHtml).not.toContain("outside label");
    expect(close).toHaveBeenCalledTimes(1);

    document.body.removeChild(outsideLabel);
  });

  it("shows an error when the print popup is blocked", () => {
    const container = document.createElement("div");
    const insideLabel = document.createElement("div");
    insideLabel.className = "print-label";
    container.appendChild(insideLabel);

    vi.spyOn(window, "open").mockReturnValue(null);

    const { result } = renderHook(() =>
      useLabelPrint(createLabel(), createRefFor(container))
    );

    act(() => {
      result.current.print();
    });

    expect(toastMock.error).toHaveBeenCalledWith(
      "Popup Blocked",
      "Please allow popups to print labels."
    );
  });
});
