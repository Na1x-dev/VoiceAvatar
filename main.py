# import tkinter as tk
# import tkinter as ttk

# class VoiceAvatarApp:
#     def init_window(self):
#         screen_width = self.root.winfo_screenwidth()
#         screen_height = self.root.winfo_screenheight()
#         self.window_width = int(screen_width // 2.8)
#         self.window_height = int(screen_height // 1.2)
#         x_position = (screen_width // 2) - (self.window_width // 2)
#         y_position = (screen_height // 2) - int(self.window_height // 1.85)
#         self.root.geometry(f"{self.window_width}x{self.window_height}+{x_position}+{y_position}")
#         self.root.title("VoiceAvatar")

#     def init_control_frame(self):
#         self.control_frame = tk.Frame(self.root, bg="#0a172e")
#         self.control_frame.grid(row=0, column=0, sticky="nsew")

#         # Установим вес для строк и столбцов в control_frame
#         self.control_frame.grid_rowconfigure(0, weight=1)
#         self.control_frame.grid_columnconfigure(0, weight=1)

#         # Создаем Canvas для прокрутки
#         self.canvas = tk.Canvas(self.control_frame, bg="#0a172e")
#         self.scrollbar = ttk.Scrollbar(self.control_frame, orient="horizontal", command=self.canvas.xview)
#         self.scrollable_frame = tk.Frame(self.canvas, bg="#0a172e")

#         # Настройка Canvas
#         self.scrollable_frame.bind(
#             "<Configure>",
#             lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
#         )

#         self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")

#         # Привязываем scrollbar к canvas
#         self.canvas.configure(xscrollcommand=self.scrollbar.set)

#         # Располагаем canvas и scrollbar в control_frame
#         self.canvas.grid(row=0, column=0, sticky="nsew")
#         self.scrollbar.grid(row=1, column=0, sticky="ew")

#         # Установим вес для строк и столбцов в control_frame
#         self.control_frame.grid_rowconfigure(0, weight=1)
#         self.control_frame.grid_columnconfigure(0, weight=1)

#         # Добавляем элементы управления с паддингом
#         for i in range(10):  # Пример с 10 кнопками и спинбоксами
#             button = ttk.Button(self.scrollable_frame, text=f'Button {i + 1}')
#             button.grid(row=0, column=i, pady=(15, 15), padx=(15, 15))

#             spinbox = ttk.Spinbox(self.scrollable_frame, from_=0, to=10, increment=1)
#             spinbox.grid(row=1, column=i, pady=(15, 15), padx=(15, 15))


#     def init_animation_frame(self):
#         self.animation_frame = tk.Frame(self.root, bg="#00ff00")
#         self.animation_frame.grid(row=1, column=0, sticky="nsew")

#     def update_frames(self, event=None):
#         current_width = self.root.winfo_width()
#         self.animation_frame.config(height=current_width)
#         self.control_frame.config(width=current_width)
#         self.animation_frame.config(width=current_width)
#         self.root.grid_rowconfigure(0, weight=1)
#         self.root.grid_rowconfigure(1, weight=0)
#         self.root.bind("<Configure>", self.update_frames)

    
#     def __init__(self, root):
#         self.root = root
#         self.init_window()
#         self.init_control_frame()
#         self.init_animation_frame()
#         self.update_frames()


# if __name__ == "__main__":
#     root = tk.Tk()
#     app = VoiceAvatarApp(root)
#     root.mainloop()

import tkinter as tk
import tkinter.ttk as ttk  # Исправлено на tkinter.ttk

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

    def scroll_pane(self):
        self.canvas = tk.Canvas(self.control_frame, bg="#0a172e")
        self.scrollbar = ttk.Scrollbar(self.control_frame, orient="horizontal", command=self.canvas.xview)
        self.scrollable_frame = tk.Frame(self.canvas, bg="#fff")

        # Привязываем изменение размера scrollable_frame к canvas
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )

        # Создаем окно в canvas для scrollable_frame
        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")

        # Привязываем scrollbar к canvas
        self.canvas.configure(xscrollcommand=self.scrollbar.set)

        # Располагаем canvas и scrollbar в control_frame
        self.canvas.grid(row=0, column=0, sticky="nsew")  # Растягиваем canvas на всю высоту
        self.scrollbar.grid(row=1, column=0, sticky="ew")

    def button_elem(self, i):
        self.image = tk.PhotoImage(file="./images/image.png")
        button = ttk.Button(self.scrollable_frame, image=self.image)
        button.grid(row=0, column=i, sticky="nsew", padx=(15, 15)) 
        spinbox = ttk.Spinbox(self.scrollable_frame, from_=0, to=100, increment=1)
        spinbox.grid(row=1, column=i, sticky="ew", padx=(15, 15))
        button_width = button.winfo_reqwidth()
        spinbox.config(width=int(button_width / 10))  


    def init_control_frame(self):
        self.control_frame = tk.Frame(self.root, bg="#0a172e")
        self.control_frame.grid(row=0, column=0, sticky="nsew")


        self.control_frame.grid_rowconfigure(0, weight=1)
        self.control_frame.grid_columnconfigure(0, weight=1)

        self.scroll_pane()        

        # Добавляем элементы управления с паддингом
        # for i in range(10):  # Пример с 10 кнопками и спинбоксами
        self.button_elem(10)

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

    def init(self, root):
        self.root = root
        self.init_window()
        self.init_control_frame()
        self.init_animation_frame()
        self.update_frames()

if __name__ == "__main__":  # Исправлено на __name__ == "__main__"
    root = tk.Tk()
    app = VoiceAvatarApp()
    app.init(root)  # Изменено на вызов метода init
    root.mainloop()
