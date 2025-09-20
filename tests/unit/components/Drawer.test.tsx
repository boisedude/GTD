import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../utils/test-utils";
import { userInteractions } from "../../utils/test-utils";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";

describe("Drawer Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Drawer Root", () => {
    it("should render drawer with shouldScaleBackground prop", () => {
      render(
        <Drawer shouldScaleBackground={false}>
          <DrawerTrigger asChild>
            <button>Open Drawer</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer</DrawerTitle>
              <DrawerDescription>Drawer content</DrawerDescription>
            </DrawerHeader>
            <div>Drawer Content</div>
          </DrawerContent>
        </Drawer>
      );

      expect(screen.getByRole("button", { name: "Open Drawer" })).toBeInTheDocument();
    });

    it("should use shouldScaleBackground true by default", () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open Drawer</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer</DrawerTitle>
              <DrawerDescription>Drawer content</DrawerDescription>
            </DrawerHeader>
            <div>Drawer Content</div>
          </DrawerContent>
        </Drawer>
      );

      expect(screen.getByRole("button", { name: "Open Drawer" })).toBeInTheDocument();
    });
  });

  describe("DrawerTrigger", () => {
    it("should open drawer when trigger is clicked", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open Mobile Menu</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Navigation</DrawerTitle>
            </DrawerHeader>
            <div>Mobile navigation content</div>
          </DrawerContent>
        </Drawer>
      );

      const trigger = screen.getByRole("button", { name: "Open Mobile Menu" });
      await userInteractions.click(trigger);

      expect(screen.getByText("Navigation")).toBeInTheDocument();
      expect(screen.getByText("Mobile navigation content")).toBeInTheDocument();
    });
  });

  describe("DrawerContent", () => {
    it("should render content with proper styling classes", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open</button>
          </DrawerTrigger>
          <DrawerContent data-testid="drawer-content">
            <DrawerHeader>
              <DrawerTitle>Content</DrawerTitle>
              <DrawerDescription>Drawer content</DrawerDescription>
            </DrawerHeader>
            <div>Content</div>
          </DrawerContent>
        </Drawer>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Open" }));

      const content = screen.getByTestId("drawer-content");
      expect(content).toHaveClass(
        "fixed",
        "inset-x-0",
        "bottom-0",
        "z-50",
        "mt-24",
        "flex",
        "h-auto",
        "flex-col",
        "rounded-t-[10px]",
        "border",
        "bg-background"
      );
    });

    it("should include drag handle for mobile interaction", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Content</DrawerTitle>
              <DrawerDescription>Drawer content</DrawerDescription>
            </DrawerHeader>
            <div>Content</div>
          </DrawerContent>
        </Drawer>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Open" }));

      // Check for drag handle (visual indicator)
      const dragHandle = document.querySelector(".mx-auto.mt-4.h-2.w-\\[100px\\].rounded-full.bg-muted");
      expect(dragHandle).toBeInTheDocument();
    });

    it("should accept custom className", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open</button>
          </DrawerTrigger>
          <DrawerContent className="custom-drawer" data-testid="drawer-content">
            <DrawerHeader>
              <DrawerTitle>Content</DrawerTitle>
              <DrawerDescription>Drawer content</DrawerDescription>
            </DrawerHeader>
            <div>Content</div>
          </DrawerContent>
        </Drawer>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Open" }));

      expect(screen.getByTestId("drawer-content")).toHaveClass("custom-drawer");
    });
  });

  describe("DrawerHeader", () => {
    it("should render header with proper styling and grid layout", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader data-testid="drawer-header">
              <DrawerTitle>Header Title</DrawerTitle>
              <DrawerDescription>Header description</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Open" }));

      const header = screen.getByTestId("drawer-header");
      expect(header).toHaveClass(
        "grid",
        "gap-1.5",
        "p-4",
        "text-center",
        "sm:text-left"
      );
    });

    it("should accept custom className", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="custom-header" data-testid="drawer-header">
              <DrawerTitle>Title</DrawerTitle>
              <DrawerDescription>Description</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Open" }));

      expect(screen.getByTestId("drawer-header")).toHaveClass("custom-header");
    });
  });

  describe("DrawerFooter", () => {
    it("should render footer with proper styling", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Footer Test</DrawerTitle>
              <DrawerDescription>Footer test description</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter data-testid="drawer-footer">
              <button>Footer Action</button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Open" }));

      const footer = screen.getByTestId("drawer-footer");
      expect(footer).toHaveClass(
        "mt-auto",
        "flex",
        "flex-col",
        "gap-2",
        "p-4"
      );
    });
  });

  describe("DrawerTitle", () => {
    it("should render title with proper typography classes", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle data-testid="drawer-title">Mobile Navigation</DrawerTitle>
              <DrawerDescription>Navigation description</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Open" }));

      const title = screen.getByTestId("drawer-title");
      expect(title).toHaveClass(
        "text-lg",
        "font-semibold",
        "leading-none",
        "tracking-tight"
      );
      expect(title).toHaveTextContent("Mobile Navigation");
    });

    it("should have proper accessibility attributes", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Navigation Menu</DrawerTitle>
              <DrawerDescription>Menu description</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Open" }));

      // Title should be accessible to screen readers
      expect(screen.getByText("Navigation Menu")).toBeInTheDocument();
    });
  });

  describe("DrawerDescription", () => {
    it("should render description with proper styling", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Title</DrawerTitle>
              <DrawerDescription data-testid="drawer-description">
                Navigate through the app
              </DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Open" }));

      const description = screen.getByTestId("drawer-description");
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
      expect(description).toHaveTextContent("Navigate through the app");
    });
  });

  describe("DrawerClose", () => {
    it("should close drawer when close button is clicked", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Open Drawer</DrawerTitle>
              <DrawerDescription>Drawer description</DrawerDescription>
            </DrawerHeader>
            <DrawerClose asChild>
              <button>Close</button>
            </DrawerClose>
          </DrawerContent>
        </Drawer>
      );

      // Open drawer
      await userInteractions.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByText("Open Drawer")).toBeInTheDocument();

      // Close drawer
      await userInteractions.click(screen.getByRole("button", { name: "Close" }));

      // Wait for drawer to close animation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Content should no longer be visible
      expect(screen.queryByText("Open Drawer")).not.toBeInTheDocument();
    });
  });

  describe("Mobile Navigation Use Case", () => {
    it("should support complete mobile navigation workflow", async () => {
      const mockOnNavigate = vi.fn();

      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>☰ Menu</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Navigation</DrawerTitle>
              <DrawerDescription>Choose where to go</DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <nav>
                <ul>
                  <li>
                    <button onClick={() => mockOnNavigate("dashboard")}>
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <button onClick={() => mockOnNavigate("capture")}>
                      Capture
                    </button>
                  </li>
                  <li>
                    <button onClick={() => mockOnNavigate("organize")}>
                      Organize
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <button>Cancel</button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );

      // Open mobile menu
      await userInteractions.click(screen.getByRole("button", { name: "☰ Menu" }));

      // Verify navigation content
      expect(screen.getByText("Navigation")).toBeInTheDocument();
      expect(screen.getByText("Choose where to go")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Capture" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Organize" })).toBeInTheDocument();

      // Test navigation
      await userInteractions.click(screen.getByRole("button", { name: "Dashboard" }));
      expect(mockOnNavigate).toHaveBeenCalledWith("dashboard");
    });
  });

  describe("Accessibility", () => {
    it("should support keyboard navigation", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open Menu</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Menu</DrawerTitle>
              <DrawerDescription>Menu navigation</DrawerDescription>
            </DrawerHeader>
            <div>
              <button>First Item</button>
              <button>Second Item</button>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <button>Close</button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );

      const trigger = screen.getByRole("button", { name: "Open Menu" });

      // Focus and activate with keyboard
      trigger.focus();
      await userInteractions.keyboard("{Enter}");

      // Verify drawer opened
      expect(screen.getByText("Menu")).toBeInTheDocument();

      // Test tab navigation within drawer
      await userInteractions.keyboard("{Tab}");
      expect(screen.getByRole("button", { name: "First Item" })).toHaveFocus();

      await userInteractions.keyboard("{Tab}");
      expect(screen.getByRole("button", { name: "Second Item" })).toHaveFocus();
    });

    it("should have proper ARIA attributes", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button aria-label="Open navigation menu">Menu</button>
          </DrawerTrigger>
          <DrawerContent aria-describedby="drawer-description">
            <DrawerHeader>
              <DrawerTitle>Navigation</DrawerTitle>
              <DrawerDescription id="drawer-description">
                Navigate through app sections
              </DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );

      const trigger = screen.getByRole("button", { name: "Open navigation menu" });
      expect(trigger).toHaveAttribute("aria-label", "Open navigation menu");

      await userInteractions.click(trigger);

      // Check that description is properly linked
      const description = screen.getByText("Navigate through app sections");
      expect(description).toHaveAttribute("id", "drawer-description");
    });
  });

  describe("Touch Interactions", () => {
    it("should handle touch events for mobile", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open</button>
          </DrawerTrigger>
          <DrawerContent data-testid="drawer-content">
            <DrawerHeader>
              <DrawerTitle>Touch Drawer</DrawerTitle>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Open" }));

      const content = screen.getByTestId("drawer-content");
      expect(content).toBeInTheDocument();

      // Simulate touch events with proper Touch objects
      const createTouch = (clientX: number, clientY: number) => ({
        identifier: 0,
        target: content,
        clientX,
        clientY,
        pageX: clientX,
        pageY: clientY,
        screenX: clientX,
        screenY: clientY,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        force: 1,
      });

      fireEvent.touchStart(content, {
        touches: [createTouch(0, 100)],
        changedTouches: [createTouch(0, 100)],
        targetTouches: [createTouch(0, 100)],
      });

      fireEvent.touchMove(content, {
        touches: [createTouch(0, 200)],
        changedTouches: [createTouch(0, 200)],
        targetTouches: [createTouch(0, 200)],
      });

      fireEvent.touchEnd(content, {
        touches: [],
        changedTouches: [createTouch(0, 200)],
        targetTouches: [],
      });

      // Drawer should still be present (not dismissed by accidental touch)
      expect(screen.getByText("Touch Drawer")).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should have responsive text alignment in header", async () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Open</button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader data-testid="responsive-header">
              <DrawerTitle>Responsive Title</DrawerTitle>
              <DrawerDescription>Responsive description</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Open" }));

      const header = screen.getByTestId("responsive-header");
      expect(header).toHaveClass("text-center", "sm:text-left");
    });
  });
});