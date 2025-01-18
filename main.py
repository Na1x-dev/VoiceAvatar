import tkinter as tk


class VoiceAvatarApp:
    def init_window(self):
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        self.window_width = int(screen_width // 2.8)
        self.window_height = int(screen_height // 1.2)
        x_position = (screen_width // 2) - (self.window_width // 2)
        y_position = (screen_height // 2) - int(self.window_height // 1.85)
        self.root.geometry(f"{self.window_width}x{self.window_height}+{x_position}+{y_position}")
        self.root.title("VoiceAvatar")

    def init_control_frame(self):
        self.control_frame = tk.Frame(self.root, bg="#0a172e")
        self.control_frame.grid(row=0, column=0, sticky="nsew")

    def init_animation_frame(self):
        self.animation_frame = tk.Frame(self.root, bg="#00ff00")
        self.animation_frame.grid(row=1, column=0, sticky="nsew")

    def update_frames(self, event=None):
        current_width = self.root.winfo_width()
        self.animation_frame.config(height=current_width)
        self.control_frame.config(width=current_width)
        self.animation_frame.config(width=current_width)
        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_rowconfigure(1, weight=0)
        self.root.bind("<Configure>", self.update_frames)

    def create_scrollable_button_panel(self):
       pass


    def __init__(self, root):
        self.root = root
        self.init_window()
        self.init_control_frame()
        self.init_animation_frame()
        self.update_frames()
        self.create_scrollable_button_panel()




if __name__ == "__main__":
    root = tk.Tk()
    app = VoiceAvatarApp(root)
    root.mainloop()
