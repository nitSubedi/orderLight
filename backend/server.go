package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var db *gorm.DB

type orderlight struct {
	ID           uint   `gorm:"primaryKey"`
	Username     string `gorm:"unique;not null"`
	Email        string `gorm:"unique;not null"`
	Password     string `gorm:"not null"`
	hue_id       string
	hue_username string
	light_id     string
}

type JsonResponse struct {
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

type OrderStatus struct {
	OrderID string `json:"orderId"`
	Status  string `json:"status"`
}

type hueUpdate struct {
	hue_username string `json:"hue_username"`
	light_id     string `json:"light_id"`
	hue_id       string `json:"hue_id"`
	Username     string `json:"username"`
}

func main() {
	dsn := "host=localhost user=maauri password=newpassword dbname=foodlight port=5432 sslmode=disable"

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to the database:", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get sql.DB from gorm.DB:", err)
	}

	if err := sqlDB.Ping(); err != nil {
		log.Fatal("Could not ping the database:", err)
	}

	fmt.Println("Database connected successfully!")

	err = db.AutoMigrate(&orderlight{})
	if err != nil {
		log.Fatal("Failed to migrate database schema:", err)
	}
	r := mux.NewRouter()
	r.HandleFunc("/register", optionsHandler).Methods("OPTIONS")
	r.HandleFunc("/login", optionsHandler).Methods("OPTIONS")
	r.HandleFunc("/orderTracker", optionsHandler).Methods("OPTIONS")
	r.HandleFunc("/updateDB", optionsHandler).Methods("OPTIONS")
	r.HandleFunc("/register", registerUser).Methods("POST")
	r.HandleFunc("/login", login).Methods("POST")
	r.HandleFunc("/orderTracket", orderTracker)
	r.HandleFunc("/updateDB", updateDB).Methods("POST")
	log.Println("Server started at : 8080")

	log.Fatal(http.ListenAndServe(":8080", r))

}
func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func optionsHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	w.WriteHeader(http.StatusOK)
}

func respondWithJSON(w http.ResponseWriter, statusCode int, response JsonResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode JSON response", http.StatusInternalServerError)
	}
}

func createUser(username, email, password string) error {

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	user := orderlight{
		Username: username,
		Email:    email,
		Password: string(hashedPassword),
	}

	result := db.Create(&user)
	if result.Error != nil {
		return fmt.Errorf("failed to insert user into database: %w", result.Error)
	}

	return nil
}

func registerUser(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	var user struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		respondWithJSON(w, http.StatusBadRequest, JsonResponse{Error: err.Error()})
		return
	}

	err = createUser(user.Username, user.Email, user.Password)
	if err != nil {
		respondWithJSON(w, http.StatusInternalServerError, JsonResponse{Error: err.Error()})
		return
	}

	respondWithJSON(w, http.StatusCreated, JsonResponse{Message: "User created"})

}

func verifyUser(username, password string) (bool, error) {
	var user orderlight
	result := db.Where("username = ?", username).First(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, result.Error
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return false, nil
	}

	return true, nil
}

func login(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	var user struct {
		Username         string `json:"username"`
		Password         string `json:"password"`
		DoorDashEmail    string `json:"doordashemail"`
		DoorDashPassword string `json:"doorDashPassword" `
		HueBridgeIP      string `json:"huebridgeip"`
		HueUsername      string `json:"hueusername"`
	}
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		respondWithJSON(w, http.StatusBadRequest, JsonResponse{Error: err.Error()})
		return
	}

	isValid, err := verifyUser(user.Username, user.Password)
	if err != nil {
		respondWithJSON(w, http.StatusInternalServerError, JsonResponse{Error: err.Error()})
		return
	}

	if isValid {
		respondWithJSON(w, http.StatusCreated, JsonResponse{Message: "login successful"})

	} else {
		respondWithJSON(w, http.StatusUnauthorized, JsonResponse{Message: "Invalid credentials"})
	}

}

func trackOrder(orderID string) {
	cmd := exec.Command("node", "dominos.js", orderID)
	output, err := cmd.Output()
	if err != nil {
		fmt.Println("Error tracking order", err)
		return
	}
	fmt.Println(string(output))
}

func orderTracker(w http.ResponseWriter, r *http.Request) {
	orderId := r.URL.Query().Get(("orderID"))
	if orderId == "" {
		http.Error(w, "orderId is required", http.StatusBadRequest)
		return
	}
	trackOrder(orderId)
	fmt.Fprintf(w, "Order %s is being tracked", orderId)
}

func updateDB(w http.ResponseWriter, r *http.Request) {
	var req hueUpdate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Request body", http.StatusBadRequest)
		return
	}
	var user orderlight
	if err := db.Where("username=?", req.Username).First(&user).Error; err != nil {
		http.Error(w, "User not Found", http.StatusNotFound)
		return
	}

	user.hue_username = req.hue_username
	user.hue_id = req.hue_id
	user.light_id = req.light_id
	if err := db.Save(&user).Error; err != nil {
		http.Error(w, "Failed to update database with hue light details", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "hue info updated successfully")
}
